import mongoose from "mongoose";

const productsSchema = new mongoose.Schema({
    name:{type:String, required:true},
    description:{type:String, required:true},
    price:{type:Number, required:true},
    categoryId:{type:mongoose.Schema.ObjectId, required:true, ref:"categories"},
    stock:{type:Number, required:true},
    user:{type:mongoose.Schema.ObjectId, required:true , ref:"users"},
    state: { type: Number, enum: [0, 1], default: 1 } // 0: inactivo, 1: activo
},{
    timestamps:true
})

const productsModel = mongoose.model("products",productsSchema)
export default productsModel