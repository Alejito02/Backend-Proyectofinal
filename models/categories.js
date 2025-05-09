import mongoose from "mongoose";

const categoriesSchema =  new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    idCategoryFather: { type: mongoose.Schema.ObjectId, ref:'categories', default: null },
    level: { type: Number, default: 1 },
    state: { type: String, enum: [0, 1], default: 1 }, // 0 inactiva      1 activa
},{
    timestamps:true
});




const categoriesModel = mongoose.model("categories",categoriesSchema);
export default categoriesModel;