<<<<<<< HEAD
const uno = 6;
const dos = 7;
=======
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{type: String, require:true},
    email:{type:String, require:true},
    role:{type: String, require:true}, // cliente  vendedor  admin
    password:{type:String, require:true}
},{
    timestamps:true
});

const usersModel = mongoose.model("users",userSchema);
export default usersModel;
>>>>>>> 369de8d (primer endpoint)
