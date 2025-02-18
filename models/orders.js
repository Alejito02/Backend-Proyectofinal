import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId:{type:Number,required:true},
    products:[
        {
            productid : {type:mongoose.Schema.Types.ObjectId,ref:'products',required:true},
            quantity : {type:Number,required:true},
            price : {type:Number,required:true}
        }
    ],
    total:{type:Number,required:true},
    status:{type:String,required:true,enum: ['pending','paid','canceled'], default:'pending'},
    updatedAt:{type:ISODate,required:true}
})


const ordersModel = mongoose.model ("orders",orderSchema)
export default ordersModel;
