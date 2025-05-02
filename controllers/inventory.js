import inventoryModel from "../models/inventory.js";
import mongoose from "mongoose";

const postInventory = async (req, res) => {
    try {
        const {data} = req.body;

        if (!data || typeof data !== "object") {
            console.warn("[POST /inventory] invalid inventory data format", { data });
            return res.status(400).json({
                success: false,
                error: "Inventory data must be a valid object",
            });
        }

        const inventory = new inventoryModel(data);
        await inventory.save();

        const inventoryResponse = inventory.toObject();
        return res.status(200).json({
            success: true,
            inventory: inventoryResponse,
        });
    } catch (error) {
        console.error("[POST /inventory] Inventory creation failed", {
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

const putInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body.data;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.warn("[PUT /inventory] Invalid ID format");
            return res.status(400).json({ error: "Invalid ID format" });
        }

        if (!data || typeof data !== "object") {
            console.warn("[PUT /inventory] Non -valid data format");
            return res.status(400).json({
                success: false,
                error: "Non -valid data format",
            });
        }

        const updatedInventory = await inventoryModel.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true, lean: true }
        );

        if (!updatedInventory) {
            console.warn(`[PUT /inventory] Inventory data not found with ID: ${id}`);
            return res.status(404).json({
                success: false,
                error: "Inventory data not found",
                message: `No inventory data was found with the ID: ${id}`,
                details: {
                    providedId: id,
                    suggestion: "Verify the ID or check if the item was previously deleted"
                }
            })
        }

        res.status(200).json({
            success: true,
            data: updatedInventory,
        });
    } catch (error) {
        console.error("[PUT /inventory] Inventory updated failure", {
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


const getInventoryByType = async (req, res) => {
    try {
        const { type } = req.query
        const validTypes = ["entrada", "salida", "devolucion"];



        if (!type ||  !validTypes.includes(type)) {
            console.warn('Invalid type')
            return res.status(400).json({
                success: false,
                error: `Invalid type. Allowed values: ${validTypes.join(", ")}`
            });
        };

        const inventory = await inventoryModel.find({ type }).lean()

        if (inventory.length === 0) {
            console.warn('Empty data')
            return res.status(200).json({
                success: true,
                data: []
            })
        };

        res.status(200).json({
            success: true,
            count: inventory.length,
            data: inventory
        })

    } catch (error) {
        console.error("[GET /Inventory] The operation fails", {
            message: error.message,
            stack: error.stack,
        });

        return res.status(500).json({
            success: false,
            error: "Internal server error",
        });

    }
}



const getAllInventory = async (req, res) => {
    try {
        const allInventory = await inventoryModel.find().lean();

        if (allInventory.length === 0) {
            console.warn("[GET /inventory] Empty Inventory Data");
            return res.status(200).json({ data: [] });
        }

        return res.status(200).json({
            success: true,
            count: allInventory.length,
            data: allInventory,
        });
    } catch (error) {
        console.error("[GET /Inventory] The operation fails", {
            message: error.message,
            stack: error.stack,
        });

        return res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};

export { postInventory, putInventory,getInventoryByType, getAllInventory };
