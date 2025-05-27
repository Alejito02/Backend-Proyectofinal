import mongoose from "mongoose";
import ordersModel from "../models/orders.js"; 

const postOrders = async (req, res) => {
    try {
        const {data} = req.body;

        if (!data || typeof data !== "object") {
            console.warn("[POST /orders] invalid orders data format", { data });
            return res.status(400).json({
                success: false,
                error: "orders data must be a valid object",
            });
        }

        const order = new ordersModel(data);
        await order.save();

        const orderResponse = order.toObject();
        return res.status(200).json({
            success: true,
            data: orderResponse,
        });
    } catch (error) {
        console.error("[POST /order] order creation failed", {
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


const putOrders = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body.data;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.warn("[PUT /orders] Invalid ID format");
            return res.status(400).json({ error: "Invalid ID format" });
        }

        if (!data || typeof data !== "object") {
            console.warn("[PUT /orders] Non -valid data format");
            return res.status(400).json({
                success: false,
                error: "Non -valid data format",
            });
        }

        const updateOrder = await ordersModel.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true, lean: true }
        );

        if (!updateOrder) {
            console.warn(`[PUT /order] order data not found with ID: ${id}`);
            return res.status(404).json({
                success: false,
                error: "order data not found",
                message: `No order data was found with the ID: ${id}`,
                details: {
                    providedId: id,
                    suggestion: "Verify the ID or check if the order was previously deleted"
                }
            })
        }

        res.status(200).json({
            success: true,
            data: updateOrder,
        });
    } catch (error) {
        console.error("[PUT /order] order updated failure", {
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


const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.warn(`[GET order] invalid id format : ${id}`);
            return res.status(400).json({ error: "Invalid ID format" });
        }
        const order = await ordersModel.findById(id);
        if (!order) {
            console.warn(`[GET order] order with ID: ${id} not found`);
            return res.status(404).json({ error: "order not found" });
        }
        return res.status(200).json({ 
            success:true,
            data:order
         });
    } catch (error) {
        console.error(`[GET order] Critical error : ${error.message}`, error.stack);
        return res.status(500).json({ error: "Internal server error" });
    }
};


const getAllOrders = async (req, res) => {
    try {
        const orders = await ordersModel.find().select("-__v");

        if (orders.length === 0) {
            console.warn("[GET /orders] No orders found");
            return res.status(200).json({ data: [] });
        }

        return res.status(200).json({
            success: true,
            count: orders.length,
            data:orders,
        });
    } catch (error) {
        console.error("[GET /orders] Critical error:", {
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
        const order = await ordersModel.findById(id);
        if (!order) {
            console.warn(`[PUT State] order not found. ID: ${id}`);
            return res.status(404).json({ error: "order not found" });
        }
        const newState = order.state === 1 ? 0 : 1;
        order.state = newState;
        await order.save();

        return res.status(200).json({
            message: "order state updated",
            data: {
                _id: order._id,
                state: newState,
            },
        });
    } catch (error) {
        console.error("Error in putState:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


const getConvertPesosToDollars = async (req, res) => {
    try {
        // Recibe el descuento y los ítems del cuerpo de la solicitud (POST)
        const { discount, items } = req.body; 

        // Validar que discount sea un número y items un array
        if (typeof discount !== 'number' || isNaN(discount) || !Array.isArray(items)) {
            return res.status(400).json({ success: false, error: 'Invalid input: discount must be a number and items must be an array.' });
        }

        const currentDollarValue = 3900;

        // 1. Calcular el subTotal en COP directamente desde los ITEMS recibidos
        let calculatedSubTotalCOP = 0;
        items.forEach(item => {
            // Asegúrate de que item.price y item.quantity son números
            calculatedSubTotalCOP += (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0); 
        });

        // 2. Convertir todos los valores a USD y luego a CENTAVOS de USD (enteros)
        const dollarDiscountCents = Math.round((discount / currentDollarValue) * 100);
        const subTotalInDollarsCents = Math.round((calculatedSubTotalCOP / currentDollarValue) * 100);
        const amountCents = subTotalInDollarsCents - dollarDiscountCents;

        // 3. Formatear los valores de CENTAVOS a DÓLARES (con decimales) y como STRING con 2 decimales
        const subTotalFormatted = (subTotalInDollarsCents / 100).toFixed(2);
        const discountFormatted = (dollarDiscountCents / 100).toFixed(2);
        const amountFormatted = (amountCents / 100).toFixed(2);

        // 4. Convertir y formatear los ítems individuales a USD con 2 decimales
        const itemsInDollarsFormatted = items.map(product => {
            const unitPriceCents = Math.round(((parseFloat(product.price) || 0) / currentDollarValue) * 100);
            return {
                name: product.name,
                unit_amount: {
                    value: (unitPriceCents / 100).toFixed(2),
                    currency_code: 'USD'
                },
                quantity: (parseInt(product.quantity) || 0).toString() // Cantidad como string
            };
        });

        return res.status(200).json({
            success: true,
            data: {
                subTotal: subTotalFormatted,
                discount: discountFormatted,
                amount: amountFormatted,
                items: itemsInDollarsFormatted // Devolvemos los ítems ya convertidos
            }
        });

    } catch (error) {
        console.error('[GET /convertCurrency]', error);
        return res.status(400).json({ success: false, error: 'The conversion could not be performed', details: error.message });
    }
};

export {postOrders, putOrders, getOrderById, getAllOrders, putState , getConvertPesosToDollars}
