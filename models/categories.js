import mongoose from "mongoose";
const categoriesSchema = new mongoose.Schema({
    name:{type:String, require:true},
    description:{type:String, require:true},
    createdAt:{type:Date, require:true, default:1},
},{
    timestamps:true
});



const categoriesModel = mongoose.model("categories",categoriesSchema);
export default categoriesModel;