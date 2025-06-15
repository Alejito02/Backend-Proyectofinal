import mongoose from "mongoose";
import productsModel from "../models/products.js";
import inventoryModel from "../models/inventory.js";
import ordersModel from "../models/orders.js";

const postOrders = async (req, res) => {
    try {
        const { data } = req.body;

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
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;
        const data = req.body.data;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.warn("[PUT /orders] Invalid ID format");
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: "Invalid ID format" });
        }
        if (
            !data ||
            typeof data !== "object" ||
            !Array.isArray(data.products) ||
            data.products.length === 0
        ) {
            console.warn(
                "[PUT /orders] Non-valid data format or missing products array"
            );
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                error:
                    "Non-valid data format. 'data' must be an object with a non-empty 'products' array.",
            });
        }

        if (!data.userId) {
            console.warn(
                "[PUT /orders] Missing userId in data for inventory record."
            );
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                error: "User ID is required for inventory records.",
            });
        }

        for (const element of data.products) {
            const product = await productsModel
                .findById(element._id)
                .session(session);

            if (!product) {
                console.warn(`[PUT /orders] Product not found: ${element._id}`);
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({
                    success: false,
                    error: `Product with ID ${element._id} not found in inventory.`,
                });
            }

            if (product.stock < element.quantity) {
                console.warn(
                    `[PUT /orders] Insufficient stock for product: ${element._id}`
                );
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    success: false,
                    error: `Insufficient stock for product ${product.name || element._id
                        }. Required: ${element.quantity}, Available: ${product.stock}.`,
                });
            }

            await productsModel.findByIdAndUpdate(
                element._id,
                { $inc: { stock: -element.quantity } },
                { new: true, runValidators: true, session }
            );
            console.log(`Updated product ${element._id} stock.`);

            const inventoryRecord = new inventoryModel({
                productId: element._id,
                type: "outbound",
                quantity: element.quantity,
                userId: data.userId,
                orderId: id,
                reason: data.reason || "Order Fulfillment",
            });
            await inventoryRecord.save({ session });
            console.log(
                `Inventory record created for product ${element._id} related to order ${id}`
            );
        }

        const updateOrder = await ordersModel.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true, lean: true, session }
        );

        if (!updateOrder) {
            console.warn(`[PUT /orders] Order data not found with ID: ${id}`);
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                error: "Order data not found",
                message: `No order data was found with the ID: ${id}`,
                details: {
                    providedId: id,
                    suggestion:
                        "Verify the ID or check if the order was previously deleted",
                },
            });
        }

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            success: true,
            message: "Order and inventory updated successfully.",
            data: updateOrder,
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error("[PUT /orders] Order update and inventory process failed", {
            message: error.message,
            stack: error.stack,
            dataReceived: req.body.data,
            orderId: req.params.id,
        });

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                error: "Validation Error during order/inventory update.",
                details: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            error: "Internal server error during order/inventory update.",
            details: error.message,
        });
    }
};

const getOrdersById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.warn(`[GET order] invalid id format : ${id}`);
            return res.status(400).json({ error: "Invalid ID format" });
        }
        const order = await ordersModel.find({ userId: id }).populate("userId");
        if (!order) {
            console.warn(`[GET order] order with ID: ${id} not found`);
            return res.status(404).json({ error: "order not found" });
        }
        return res.status(200).json({
            success: true,
            count: order.length,
            data: order,
        });
    } catch (error) {
        console.error(`[GET order] Critical error : ${error.message}`, error.stack);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await ordersModel.find().select("-__v -products.reviews -products.categoryId").populate('userId');

        if (orders.length === 0) {
            console.warn("[GET /orders] No orders found");
            return res.status(200).json({ data: [] });
        }

        const totalIncome = orders.reduce((acc, elemento, index) => {
            const totalOrder = elemento.products.reduce((acc, elemento, index) => {
                return acc + elemento.total;
            }, 0);
            return acc + totalOrder;
        }, 0);

        const today = new Date();
        const startOfTodayUTC = new Date(Date.UTC(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            0, 0, 0, 0
        ));

        const startOfTomorrowUTC = new Date(Date.UTC(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + 1,
            0, 0, 0, 0
        ));

        const salesToday = await ordersModel.find({
            createdAt: {
                $gte: startOfTodayUTC,
                $lt: startOfTomorrowUTC
            }
        });


        return res.status(200).json({
            success: true,
            count: orders.length,
            totalIncome: totalIncome,
            salesToday: salesToday.length,
            data: orders,
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
        // Asegúrate de que el 'price' de los ítems y 'discount' sean los valores originales en COP (Pesos Colombianos)
        const { discount, items } = req.body;

        // Validar que discount sea un número y items un array
        if (
            typeof discount !== "number" ||
            isNaN(discount) ||
            !Array.isArray(items)
        ) {
            return res
                .status(400)
                .json({
                    success: false,
                    error:
                        "Invalid input: discount must be a number and items must be an array.",
                });
        }

        // Valor actual del dólar (COP por 1 USD)
        // Usar un valor con más precisión podría ayudar a reducir errores de redondeo,
        // pero el problema principal es la consistencia en el redondeo final.
        const currentDollarValue = 4.123; // Asumimos esta tasa de conversión

        // 1. Convertir y formatear los ítems individuales a USD con 2 decimales
        // ESTA SERÁ LA FUENTE DE LA VERDAD PARA EL 'item_total'
        const itemsInDollarsFormatted = items.map((product) => {
            // Asegúrate de que item.price es un número para la división
            const originalPriceCOP = parseFloat(product.price) || 0;
            const originalQuantity = parseInt(product.quantity, 10) || 0; // Base 10 for parseInt

            // Convertir precio unitario a dólares y luego a centavos, y redondear
            const unitPriceInCents = Math.round(
                (originalPriceCOP / currentDollarValue) * 100
            );

            return {
                name: product.name,
                unit_amount: {
                    // Convertir centavos de nuevo a dólares con 2 decimales y como String
                    value: (unitPriceInCents / 100).toFixed(2),
                    currency_code: "USD",
                },
                // La cantidad debe ser un String según la API de PayPal
                quantity: originalQuantity.toString(),
            };
        });

        // 2. Calcular el subTotal en USD sumando los valores formateados de los ítems
        // Esto GARANTIZA que el 'item_total' sea EXACTAMENTE la suma de los 'items'
        let calculatedSubTotalUSD = 0;
        itemsInDollarsFormatted.forEach((item) => {
            // Usa parseFloat para sumar los valores ya redondeados a 2 decimales
            calculatedSubTotalUSD +=
                parseFloat(item.unit_amount.value) * parseInt(item.quantity, 10);
        });

        // Asegúrate de que el subtotal final tenga 2 decimales y sea un string
        const subTotalFormatted = calculatedSubTotalUSD.toFixed(2);


        // 3. Convertir el descuento a USD, redondear a centavos y luego formatear a 2 decimales
        const originalDiscountCOP = parseFloat(discount) || 0;
        const discountInCents = Math.round(
            (originalDiscountCOP / currentDollarValue) * 100
        );
        const discountFormatted = (discountInCents / 100).toFixed(2);

        // 4. Calcular el monto total final (amount) a partir del subTotal formateado y el descuento formateado
        // Asegúrate de que se realice la operación numérica antes de toFixed
        const finalAmountUSD = parseFloat(subTotalFormatted) - parseFloat(discountFormatted);
        const amountFormatted = finalAmountUSD.toFixed(2);


        return res.status(200).json({
            success: true,
            data: {
                // Ahora, estos valores serán consistentes entre sí
                subTotal: subTotalFormatted, // Este es el item_total para PayPal
                discount: discountFormatted,
                amount: amountFormatted,     // Este es el monto total para PayPal
                items: itemsInDollarsFormatted, // Estos son los ítems individuales
            },
        });
    } catch (error) {
        console.error("[GET /convertCurrency]", error);
        return res
            .status(400)
            .json({
                success: false,
                error: "The conversion could not be performed",
                details: error.message,
            });
    }
};

export {
    postOrders,
    putOrders,
    getOrdersById,
    getAllOrders,
    putState,
    getConvertPesosToDollars,
};
