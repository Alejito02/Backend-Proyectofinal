import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId, required:true, ref:'users'},
    products:[
        {
            productid : {type:mongoose.Schema.Types.ObjectId,ref:'products',required:true},
            quantity : {type:Number,required:true},
            price : {type:Number,required:true}
        }
    ],
    total:{type:Number,required:true},
    status:{type:String,required:true,enum: ['pending','paid','canceled'], default:'pending'},
    state: { type: Number, enum: [0, 1], default: 1 } // 0: inactivo, 1: activo
},{
    timestamps:true
})


const ordersModel = mongoose.model ("orders",orderSchema)
export default ordersModel;
