import mongoose from "mongoose";

const productsSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    brand:{type: String, required: true, default:'Generico'},
    images: [
        {
            urlImage: { type: String, required: true },
            publicId: { type: String, required: true }
        }
    ],
    price: { type: Number, required: true },
    reviews:[
        {
            userId:{type:mongoose.Schema.ObjectId , ref:"users"},
            stars:{type:Number, default:0},
            message:{type:String,}
        }
    ],
    offer:{type:Number, default:0}, // 0 = No esta en oferta   1 = esta en oferta
    offerPrice:{type:Number , default :0},
    discountPercentage:{type:Number, default :0},
    offerDateRange:{type:Object},
    details:{type:Object},
    acceptReturns:{type:String, enum:['Si','No'], required:true},
    averageRating:{type:Number, default: 3},
    categoryId: { type: mongoose.Schema.ObjectId, required: true, ref:"categories" },
    stock: { type: Number, required: true },
/*     user: { type: mongoose.Schema.ObjectId, required: true, ref: "users" }, */
    state: { type: Number, enum: [0, 1], default: 1 } // 0: inactivo, 1: activo
}, {
    timestamps: true
})

const productsModel = mongoose.model("products", productsSchema)
export default productsModel