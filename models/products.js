import mongoose from "mongoose";

const productsSchema = new mongoose.Schema({
    name:{type:String, required:true},
    description:{type:String, required:true},
    price:{type:Number, required:true},
    categoryId:{type:mongoose.Schema.ObjectId, required:true, ref:"categories"},
    supplierId:{type:mongoose.Schema.ObjectId, required:true, ref:"suppliers"},
    stock:{type:Number, required:true},
    user:{type:mongoose.Schema.ObjectId, required:true , ref:"users"}
},{
    timestamps:true
})

const productsModel = mongoose.model("products",productsSchema)
export default productsModel