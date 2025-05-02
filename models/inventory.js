import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.ObjectId, required: true, ref: "products" },
    type: { type: String, enum: ["entrada", "salida", "devolucion"], required: true },
    quantity: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.ObjectId, required: true, ref: "users" },
    reason: { type: String } // Opcional
}, {
    timestamps: true
});

const inventoryModel = mongoose.model("inventory", inventorySchema);
export default inventoryModel;