import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId:{type:Number,requiered:true},
    products:[
        {
            productid : {type:mongoose.Schema.Types.ObjectId,ref:'products',requiered:true},
            quantity : {type:Number,requiered:true},
            price : {type:Number,requiered:true}
        }
    ],
    total:{type:Number,requiered:true},
    status:{type:String,requiered:true,enum: ['pending','paid','canceled'], default:'pending'},
    updatedAt:{type:ISODate,requiered:true}
})


const ordersModel = mongoose.model ("orders",orderSchema)
export default ordersModel;
