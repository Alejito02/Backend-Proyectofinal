import mongoose from "mongoose";
import ordersModel from "../models/orders"; 
   // create one order 
    const  postorders = async (req, res) => {
        try {
            const {userid,products,total,status,updatedAt
            }= req.body
            const orders = new ordersModel({
                userid,products,total,status,updatedAt
            });
            await orders.save();
            res.json({orders});
        } catch (error) {
            res.status(400).json({ error: "Error creating a new order" });
            console.log(error);
        }
    }


export { postorders};