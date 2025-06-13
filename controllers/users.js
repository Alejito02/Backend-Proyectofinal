import mongoose from "mongoose";
import {usersModel} from "../models/users.js";
import bcrypt from 'bcrypt';
import { generateJwt } from "../middlewares/validateToken.js";




const login = async (req, res) => {
    const { user, password } = req.body;

    try {
        if (!user || !password) {
            console.warn("[POST /login] Incorrect credentials", { attempt: req.body });
            return res.status(400).json({
                success: false,
                error: "User and password are required",
            });
        }

        const userDb = await usersModel.findOne({ email:user}).select('+password');
        console.log(userDb);
        if (!userDb) {
            console.warn(`[POST /login] Login attempt with non -existent user: ${user}`);
            return res.status(401).json({ 
                success: false,
                error: "Invalid credentials", 
            });
        }

        const isValidPassword = await bcrypt.compare(password, userDb.password);
        if (!isValidPassword) {
            console.log(`[POST /login] Login attempt with incorrect password for user: ${password}`);
            return res.status(401).json({
                success: false,
                error: "Invalid credentials",
            });
        }

        const token = generateJwt(userDb._id);

        console.info(`Successful login for the user: ${user}`, { 
            role: userDb.role,
            action: "login" 
        });

        res.status(200).json({
            success: true,
            data: {
                token,
                user: {
                    _id: userDb._id,
                    name: userDb.name,
                    role: userDb.role,
                },
            },
        });

    } catch (error) {
        console.error("[POST /login] Error in login process", {
            error: error.message,
            stack: error.stack,
        });

        res.status(500).json({
            success: false,
            error: "Authentication failed",
        });
    }
};





const postUsers = async (req, res) => {
    const { data } = req.body;

    try {
        if (!data || typeof data !== "object") {
            console.warn("[POST /users] Invalid user data format", { data });
            return res.status(400).json({
                success: false,
                error: "User data must be a valid object"
            });
        }


        //poner validaciones para email y numeros , no se puede crear un documento si el email o telefono ya existe en la base

        const encryptedPassword = await bcrypt.hash(data.password , 10);
        const user = new usersModel(data);
        user.password = encryptedPassword
        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password
        return res.status(201).json({
            success: true,
            user: userResponse,
        });
    } catch (error) {
        console.error("[POST /users] User creation failed:", {
            error: error.message,
            stack: error.stack,
        });

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                error: "Validation error",
            });
        }

        return res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};


const putUser = async (req, res) => {
    const { id } = req.params;
    const { data } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }
        if (!data || typeof data !== "object") {
            console.warn(`[PUT /users] Invalid update data. User ID: ${id}`);
            return res.status(400).json({
                success: false,
                error: "Invalid update data format",
            });
        }

        const updatedUser = await usersModel.findByIdAndUpdate(
            id,
            { $set: data },
            {
                new: true,
                runValidators: true,
                select: "-password -__v",
                lean: true,
            }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.json({ user: updatedUser });
    } catch (error) {
        console.error("Update error:", {
            message: error.message,
            stack: error.stack,
        });
        return res.status(400).json({ error: "Update failed" });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await usersModel.find().select("-password -__v");
        const activeUsers = await usersModel.find({state:1}).select("-password -__v");
        const inactiveUsers = await usersModel.find({state:0}).select("-password -__v");
        const administrators = await usersModel.find({role:0}).select("-password -__v");;


        if (users.length === 0 && activeUsers.length === 0 && inactiveUsers.length === 0 && administrators.length === 0){
            console.warn("[GET /users] No users found");
            return res.status(200).json({ users: [] });
        }

        return res.status(200).json({
            success: true,
            count: users.length,
            activeUsers:activeUsers.length,
            inactiveUsers:inactiveUsers.length,
            administrators:administrators.length,
            users,
        });
    } catch (error) {
        console.error("[GET /users] Critical error:", {
            message: error.message,
            stack: error.stack,
        });
        return res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};

const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.warn(`[GET user] invalid id format : ${id}`);
            return res.status(400).json({ error: "Invalid ID format" });
        }
        const user = await usersModel.findById(id).select('-password');
        if (!user) {
            console.warn(`[GET user] User with ID: ${id} not found`);
            return res.status(404).json({ error: "User not found" });
        }
        return res.status(200).json({ user });
    } catch (error) {
        console.error(`[GET user] Critical error : ${error.message}`, error.stack);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const putState = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.warn(`[PUT State] Invalid ID format: ${id}`);
            return res.status(400).json({ error: "invalid ID format" });
        }
        const user = await usersModel.findById(id);
        if (!user) {
            console.warn(`[PUT State] User not found. ID: ${id}`);
            return res.status(404).json({ error: "User not found" });
        }
        const newState = user.state === 1 ? 0 : 1;
        user.state = newState;
        await user.save();

        return res.status(200).json({
            message: "User state updated",
            user: {
                _id: user._id,
                state: newState,
            },
        });
    } catch (error) {
        console.error("Error in putState:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const updatePassword = async (req,res)=>{
    try {
        const {password, email} = req.body;
        const user = await usersModel.findOne({email});
        if (!user) {
            console.warn(`[PUT State] User not found. Email: ${email}`);
            return res.status(404).json({ error: "User not found" });
        }

        const encryptedPassword = await bcrypt.hash(password , 10);
        if(!encryptedPassword){
            console.warn(`[PUT /password] Error updating password`, encryptedPassword)
            return res.status(400).json({error:'Error updating password'})
        }
        user.password = encryptedPassword
        await user.save();
        return res.status(200).json({success:true, message:"updated password"})
    } catch (error) {
         console.error("Error in put password:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}



const checkPhoneNumberExistence = async (req, res) => {
    try {
        const { phone } = req.params; 

        if (!phone) {
            console.warn("[checkPhoneNumberExistence] Phone number was not provided.");
            return res.status(400).json({
                success: false,
                message: "Phone number is required."
            });
        }

        const phoneNumber = phone.split('+57')[1]
        const user = await usersModel.findOne({ phone: phoneNumber }); 

        if (!user) {
            console.log(`[checkPhoneNumberExistence] No user found for phone number: ${phone}`);
            return res.status(404).json({ // Use 404 Not Found
                success: false,
                message: "If this phone number is associated with an account, a code will be sent."
            });
        }

        res.status(200).json({
            success: true,
            email: user.email, 
            message: "Phone number found." 
        });

    } catch (error) {
        console.error('[checkPhoneNumberExistence] Error in controller:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later."
        });
    }
};



export {login, postUsers, putUser, getUsers, getUser, putState, updatePassword, checkPhoneNumberExistence };
