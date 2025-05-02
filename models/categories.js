import mongoose from "mongoose";
const categoriesSchema = new mongoose.Schema({
    name:{type:String, trim:true, required:true},
    description:{type:String, required:true},
    state: { type: Number, enum: [0, 1], default: 1 } // 0: inactivo, 1: activo
},{
    timestamps:true
});



const categoriesModel = mongoose.model("categories",categoriesSchema);
export default categoriesModel;