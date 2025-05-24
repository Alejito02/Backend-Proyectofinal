import mongoose from "mongoose";

const categoriesSchema =  new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    characteristics:{type:Array},
    state: { type: String, enum: [0, 1], default: 1 }, // 0 inactiva      1 activa
},{
    timestamps:true
});



const categoriesModel = mongoose.model("categories",categoriesSchema);
export default categoriesModel;