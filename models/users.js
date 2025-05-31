import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 50 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, select: false },
    lastName: { type: String, trim: true, maxlength: 50, default: "No especificado" }, 
    phone: { type: String, trim: true, maxlength: 20, default: "N/A" }, 
    shippingAddress: {
        street: { type: String, trim: true, maxlength: 100, default: "No especificado" },
        city: { type: String, trim: true, maxlength: 50, default: "No especificada" },
        state: { type: String, trim: true, maxlength: 50, default: "No especificado" },
        zipCode: { type: String, trim: true, maxlength: 10, default: "N/A" },
        country: { type: String, trim: true, maxlength: 50, default: "No especificado" }
    },
    
    dateOfBirth: { type: Date, default: null }, // Fecha de nacimiento, null por defecto
    gender: { 
        type: String, 
        enum: ['Masculino', 'Femenino', 'Otro', 'Prefiero no decir', 'No especificado'], 
        trim: true, 
        default: "No especificado" 
    }, // Género
    profilePicture: { type: String, trim: true, default: "N/A" }, // URL de la foto de perfil

    // Roles y Estado (estos pueden tener defaults que no son "No especificado" ya que no dependen del usuario)
    role: { type: Number, enum: [0, 1], default: 1 }, // 0: admin, 1: usuario
    state: { type: Number, enum: [0, 1], default: 1 } // 0: inactivo, 1: activo
    
}, {
    timestamps: true
});

export const usersModel = mongoose.model("users", userSchema);