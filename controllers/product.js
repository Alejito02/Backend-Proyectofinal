import productsModel from "../models/products.js";
import mongoose from "mongoose";

const postProduct = async (req, res) => {
    try {
        const { data } = req.body;
        const images = req.files

        if (!images) {
            return res.status(400).json({ message: 'No image uploaded' });
        }

        data.images = []
        for (const element of images) {
            data.images.push({
                urlImage: element.path,
                publicId: element.filename
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
        const { data } = req.body;

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
            success: true,
            data: product
        });
    } catch (error) {
        console.error(`[GET product] Critical error : ${error.message}`, error.stack);
        return res.status(500).json({ error: "Internal server error" });
    }
};



const getAllProducts = async (req, res) => {
    try {
        const products = await productsModel.find().select("-__v").populate('reviews.userId');

        if (products.length === 0) {
            console.warn("[GET /products] No products found");
            return res.status(200).json({ data: [] });
        }
        //modificar para calcular tambien los que estan con stock 0


        const stock = products.reduce((accumulator, product) => {
            if (product.stock > 0) {
                accumulator.stockAvailable += product.stock;
            } else {
                accumulator.zeroStock++;
            }
            return accumulator;
        }, { stockAvailable: 0, zeroStock: 0 });

        return res.status(200).json({
            success: true,
            count: products.length,
            stock: stock,
            data: products,
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



const addReviewToProduct = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id: productId } = req.params;
        const { userId, stars, message } = req.body;

        // Validaciones completas
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "ID de producto inválido"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "ID de usuario inválido"
            });
        }

        if (typeof stars !== 'number' || stars < 1 || stars > 5) {
            return res.status(400).json({
                success: false,
                message: "Las estrellas deben ser un número entre 1 y 5"
            });
        }

        // Verificar si el usuario ya tiene una reseña
        const product = await productsModel.findById(productId).session(session);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Producto no encontrado"
            });
        }

        const reviewIndex = product.reviews.findIndex(r => r.userId.toString() === userId);

        // Operación de actualización/inserción
        let updateOperation;
        let messageResponse;

        if (reviewIndex >= 0) {
            // Actualizar reseña existente
            updateOperation = {
                $set: {
                    [`reviews.${reviewIndex}.stars`]: stars,
                    [`reviews.${reviewIndex}.message`]: message,
                    [`reviews.${reviewIndex}.updatedAt`]: new Date()
                }
            };
            messageResponse = "Reseña actualizada exitosamente";
        } else {
            // Agregar nueva reseña
            updateOperation = {
                $push: {
                    reviews: {
                        userId,
                        stars,
                        message,
                        createdAt: new Date()
                    }
                }
            };
            messageResponse = "Reseña agregada exitosamente";
        }

        // Ejecutar la operación
        const updatedProduct = await productsModel.findByIdAndUpdate(
            productId,
            updateOperation,
            { new: true, session }
        ).populate('reviews.userId');

        // Calcular nuevo promedio
        const reviews = updatedProduct.reviews;
        const totalStars = reviews.reduce((sum, r) => sum + r.stars, 0);
        const averageRating = parseFloat((totalStars / reviews.length).toFixed(2));

        await productsModel.findByIdAndUpdate(
            productId,
            { $set: { averageRating, reviewCount: reviews.length } },
            { session }
        );

        await session.commitTransaction();

        res.status(200).json({
            success: true,
            message: messageResponse,
            product: updatedProduct,
            averageRating,
            reviewCount: reviews.length
        });

    } catch (error) {
        await session.abortTransaction();
        console.error("[PUT /product/reviews]", error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "El usuario ya ha realizado una reseña para este producto"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Error al procesar la reseña",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        session.endSession();
    }
};



const productSearch = async (req, res) => {
    try {
        const {
            search,
            categoryId,
            min_price,
            max_price,
            sort_by,
            in_stock,
        } = req.query;

        let query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        if (categoryId) {
            query.categoryId = categoryId;
        }

        if (min_price || max_price) {
            query.price = {};
            if (min_price) {
                query.price.$gte = parseFloat(min_price);
            }
            if (max_price) {
                query.price.$lte = parseFloat(max_price);
            }
        }

        if (in_stock === 'true') {
            query.stock = { $gt: 0 };
        }

        let sortOptions = {};
        switch (sort_by) {
            case 'price_asc':
                sortOptions.price = 1;
                break;
            case 'price_desc':
                sortOptions.price = -1;
                break;
            case 'rating_desc':
                sortOptions.averageRating = -1;
                break;
            case 'relevance':
            default:
                break;
        }

        const products = await productsModel.find(query)
            .sort(sortOptions);

        if (products.length === 0 && Object.keys(query).length > 0) {
            console.log(`[/GET /search] No products found for the given criteria.`);
            return res.status(404).json({
                success: false,
                error: "No products found matching your search criteria."
            });
        }

        return res.status(200).json({
            success: true,
            data: products,
            message: "Products retrieved successfully."
        });

    } catch (error) {
        console.error("[GET /search] Error searching for products:", error);
        return res.status(500).json({ success: false, error: "Internal server error while searching for products." });
    }
};


export { postProduct, putProduct, getProductById, getAllProducts, putState, addReviewToProduct , productSearch }