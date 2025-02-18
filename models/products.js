import mongoose from "mongoose";

const productsSchema = new mongoose.Schema({
    name:{type:String, require:true},
    description:{type:String, require:true},
    price:{type:Number, require:true},
    categoryId:{type:mongoose.Schema.ObjectId, require:true, ref:"categories"},
    supplierId:{type:mongoose.Schema.ObjectId, require:true, ref:"suppliers"},
    stock:{type:Number, require:true},
    user:{type:mongoose.Schema.ObjectId, require:true , ref:"users"}
},{
    timestamps:true
})

const productsModel = mongoose.model("products",productsSchema)
export default productsModel