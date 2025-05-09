import categoriesModel from "../models/categories.js";
import mongoose from "mongoose";

const postCategories = async (req, res) => {
    try {
        const {data} = req.body;

        if (!data || typeof data !== "object") {
            console.warn("[POST /categories] invalid categories data format", { data });
            return res.status(400).json({
                success: false,
                error: "categories data must be a valid object",
            });
        }

        if(data.idCategoryFather){
            const categoryFather = await categoriesModel.findById(data.idCategoryFather).lean();
            if(categoryFather){
                data.level = categoryFather.level + 1
            }
            else {
                console.warn("[POST /categories] Father category is not found" , {categoryFather});
                return res.status(400).json({
                    success: false,
                    error: "Father category is not found",
                });
            }
        }

        const categories = new categoriesModel(data);
        await categories.save();

        const categoriesResponse = categories.toObject();
        return res.status(200).json({
            success: true,
            data: categoriesResponse,
        });
    } catch (error) {
        console.error("[POST /categories] categories creation failed", {
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


const putCategories = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body.data;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.warn("[PUT /categories] Invalid ID format");
            return res.status(400).json({ error: "Invalid ID format" });
        }

        if (!data || typeof data !== "object") {
            console.warn("[PUT /categories] Non -valid data format");
            return res.status(400).json({
                success: false,
                error: "Non -valid data format",
            });
        }

        const updateCategory = await categoriesModel.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true, lean: true }
        );

        if (!updateCategory) {
            console.warn(`[PUT /categories] category data not found with ID: ${id}`);
            return res.status(404).json({
                success: false,
                error: "category data not found",
                message: `No category data was found with the ID: ${id}`,
                details: {
                    providedId: id,
                    suggestion: "Verify the ID or check if the category was previously deleted"
                }
            })
        }

        res.status(200).json({
            success: true,
            data: updateCategory,
        });
    } catch (error) {
        console.error("[PUT /categories] category updated failure", {
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


const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.warn(`[GET category] invalid id format : ${id}`);
            return res.status(400).json({ error: "Invalid ID format" });
        }
        const category = await categoriesModel.findById(id);
        if (!category) {
            console.warn(`[GET caetgory] category with ID: ${id} not found`);
            return res.status(404).json({ error: "category not found" });
        }
        return res.status(200).json({ 
            success:true,
            data:category
         });
    } catch (error) {
        console.error(`[GET category] Critical error : ${error.message}`, error.stack);
        return res.status(500).json({ error: "Internal server error" });
    }
};



const getAllCategories = async (req, res) => {
    try {
        const categories = await categoriesModel.find().select("-__v");

        if (categories.length === 0) {
            console.warn("[GET /categories] No categories found");
            return res.status(200).json({ data: [] });
        }

        return res.status(200).json({
            success: true,
            count: categories.length,
            data:categories,
        });
    } catch (error) {
        console.error("[GET /categories] Critical error:", {
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
        const category = await categoriesModel.findById(id);
        if (!category) {
            console.warn(`[PUT State] category not found. ID: ${id}`);
            return res.status(404).json({ error: "category not found" });
        }
        const newState = category.state === 1 ? 0 : 1;
        category.state = newState;
        await category.save();

        return res.status(200).json({
            message: "category state updated",
            data: {
                _id: category._id,
                state: newState,
            },
        });
    } catch (error) {
        console.error("Error in putState:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};



export {postCategories, putCategories, getCategoryById, getAllCategories, putState};
