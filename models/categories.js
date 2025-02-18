import mongoose from "mongoose";
const categoriesSchema = new mongoose.Schema({
    name:{type:String, required:true},
    description:{type:String, required:true},
    createdAt:{type:Date, required:true, default:1},
},{
    timestamps:true
});



const categoriesModel = mongoose.model("categories",categoriesSchema);
export default categoriesModel;