import usersModel from "../models/users.js";

const postUsers = async (req,res) =>{
try {
    const {name, email, role, password} = req.body;
    const user =  new usersModel({
        name,
        email,
        role,
        password
    });
    await user.save();
    res.json({user})
} catch (error) {
    res.status(400).json({error:"fallo-registro-user"})
    console.log(error);
}
}

export {postUsers};