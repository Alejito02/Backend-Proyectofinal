import mongoose from "mongoose";

const favoritesSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.ObjectId, required: true, ref: "products" },
    userId: { type: mongoose.Schema.ObjectId, required: true, ref: "users" },
     state: { type: Number, enum: [0, 1], default: 0 } // 0: inactivo(no esta en favoritos ), 1: activo (articulo favorito)
})

const favoritesModel = mongoose.model("favorites", favoritesSchema);
export default favoritesModel;