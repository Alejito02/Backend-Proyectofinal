import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{type: String, required:true},
    email:{type:String, required:true},
    role:{type: String, required:true}, //   admin  usuarios
    password:{type:String, required:true},
    state:{type:Number, default:1}
},{
    timestamps:true
});

const usersModel = mongoose.model("users",userSchema);
export default usersModel;
