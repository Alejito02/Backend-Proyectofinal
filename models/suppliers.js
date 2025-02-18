import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contact: [
        {
            name: { type: String, required: true },
            email: { type: String, required: true },
            phone: { type: String, required: true }, 
        }
    ],
    address: { type: String, required: true },
}, {
    timestamps: true, // Fechas de creación y actualización
});

const Supplier = mongoose.model('suppliers', supplierSchema);

export default Supplier;
