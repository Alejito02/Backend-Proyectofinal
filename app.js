import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import users from './routes/users.js'
import suppliers from './routes/suppliers.js'

const app= express();
app.use(express.json());
app.use("/api/users/",users)
app.use("/api/suppliers/",suppliers)
dotenv.config()



app.listen(process.env.PORT,()=>{
    console.log("Escuchando en el puerto"+ process.env.PORT);
    mongoose.connect(process.env.CNX_MONGO)
    .then(()=>console.log("conected!"))
    .catch((error)=>console.log(error))
})