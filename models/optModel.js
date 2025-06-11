import mongoose from "mongoose";

const optSchema = new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId, ref:'users', required:true},
    code:{Number, required:true,},
    createdAt:{type:Date, default:Date.now, expires:'15m'}
});

export const optModel = mongoose.model('code', optSchema)