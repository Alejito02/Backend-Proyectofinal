import usersModel from "../models/users.js";

const postUsers = async (req,res) =>{
try {
    const {name, email, role, password ,state} = req.body;
    const user =  new usersModel({
        name,
        email,
        role,
        password,
        state
    });
    await user.save();
    res.json({user})
} catch (error) {
    res.status(400).json({error:"the user registration has failed"})
    console.log(error);
}
}

const putUser = async(req,res)=>{
    const {id} = req.params
    try {
        const {name, email, role, password} = req.body
        const user = await usersModel.findByIdAndUpdate(id,{
            name,
            email,
            role,
            password
        },{new:true})
        res.json({user})
    } catch (error) {
        res.status(400).json({error:"user update has failed"})
        console.log(error);
        console.log(id);
    }
}



const getUsers = async(req,res)=>{
    try {
        const users = await usersModel.find()
        res.json({users});
    } catch (error) {
        res.status(400).json({error:"the operations fails"})
        console.log(error);
    }
}


const getUser = async (req,res)=>{
    try {
        const {id} = req.params
        const user = await usersModel.findById(id);
        if(!user){
            throw new Error("User not found")
        }
        res.json({user})
    } catch (error) {
        res.status(404).json({error:error.message})
    }
}


const putState = async (req,res)=>{
    try {
        const {id}= req.params
        const User = await usersModel.findById(id)
        if(User.state == 1){
            const user = await usersModel.findByIdAndUpdate(id,{state:0},{new:true});
            res.json({user})
        }else{
            const user = await usersModel.findByIdAndUpdate(id,{state:1},{new:true});
            res.json({user})
        }
    } catch (error) {
        res.status(404).json({error:"the operations fails"})
    }
}



export {postUsers, putUser, getUsers ,getUser ,putState};