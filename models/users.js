import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 50 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: { type: Number, required: true, enum: [0, 1], default: 1 }, // 0: admin, 1: usuario
    state: { type: Number, enum: [0, 1], default: 1 } // 0: inactivo, 1: activo
}, {
    timestamps: true
});

export const usersModel = mongoose.model("User", userSchema);
