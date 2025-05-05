import productsModel from "../models/products.js";
import mongoose from "mongoose";

const postProduct = async (req, res) => {
    try {
        const {data} = req.body;
        const images = req.files

        if(!images){
            return res.status(400).json({ message: 'No image uploaded' });
        }

        data.images = []
        for(const element of images){
            data.images.push({
                urlImage: element.path,
                publicId:element.filename
            }) 
        }

        if (!data || typeof data !== "object") {
            console.warn("[POST /product] invalid inventory data format", { data });
            return res.status(400).json({
                success: false,
                error: "Product data must be a valid object",
            });
        }

        const product = new productsModel(data);
        await product.save();

        const productResponse = product.toObject();
        return res.status(200).json({
            success: true,
            data: productResponse,
        });
    } catch (error) {
        console.error("[POST /product] product creation failed", {
            error: error.message,
            stack: error.stack,
        });

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                error: "Validation error",
            });
        }

        return res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};



const putProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const {data} = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.warn("[PUT /product] Invalid ID format");
            return res.status(400).json({ error: "Invalid ID format" });
        }

        if (!data || typeof data !== "object") {
            console.warn("[PUT /product] Non -valid data format");
            return res.status(400).json({
                success: false,
                error: "Non -valid data format",
            });
        }

        const updatedProduct = await productsModel.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true, lean: true }
        );

        if (!updatedProduct) {
            console.warn(`[PUT /product] product not found with ID: ${id}`);
            return res.status(404).json({
                success: false,
                error: "Product not found",
                message: `product data was found with the ID: ${id}`,
                details: {
                    providedId: id,
                    suggestion: "Verify the ID or check if the product was previously deleted"
                }
            })
        }

        res.status(200).json({
            success: true,
            data: updatedProduct,
        });
    } catch (error) {
        console.error("[PUT /product] product updated failure", {
            message: error.message,
            stack: error.stack,
        });

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                error: "Validation Error",
            });
        }

        return res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};


const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.warn(`[GET product] invalid id format : ${id}`);
            return res.status(400).json({ error: "Invalid ID format" });
        }
        const product = await productsModel.findById(id);
        if (!product) {
            console.warn(`[GET product] product with ID: ${id} not found`);
            return res.status(404).json({ error: "product not found" });
        }
        return res.status(200).json({ 
            success:true,
            data:product
         });
    } catch (error) {
        console.error(`[GET product] Critical error : ${error.message}`, error.stack);
        return res.status(500).json({ error: "Internal server error" });
    }
};



const getAllProducts = async (req, res) => {
    try {
        const products = await productsModel.find().select("-__v");

        if (products.length === 0) {
            console.warn("[GET /products] No products found");
            return res.status(200).json({ data: [] });
        }

        return res.status(200).json({
            success: true,
            count: products.length,
            data:products,
        });
    } catch (error) {
        console.error("[GET /products] Critical error:", {
            message: error.message,
            stack: error.stack,
        });
        return res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};



const putState = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.warn(`[PUT State] Invalid ID format: ${id}`);
            return res.status(400).json({ error: "invalid ID format" });
        }
        const product = await productsModel.findById(id);
        if (!product) {
            console.warn(`[PUT State] product not found. ID: ${id}`);
            return res.status(404).json({ error: "product not found" });
        }
        const newState = product.state === 1 ? 0 : 1;
        product.state = newState;
        await product.save();

        return res.status(200).json({
            message: "product state updated",
            data: {
                _id: product._id,
                state: newState,
            },
        });
    } catch (error) {
        console.error("Error in putState:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export {postProduct, putProduct, getProductById, getAllProducts, putState}