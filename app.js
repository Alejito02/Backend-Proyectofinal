import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv"; 

import usersRouter from "./routes/users.js";
import categoriesRouter from "./routes/categories.js";
import inventoryRouter from "./routes/inventory.js"
import productRouter from './routes/product.js'
import ordersRouter from './routes/orders.js'

dotenv.config();
const app = express();

app.use(express.json());
app.use("/api/users", usersRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/product", productRouter);
app.use("/api/orders", ordersRouter)

const startServer = async () => {
    try {
        mongoose.set("strictQuery", true);

        await mongoose.connect(process.env.CNX_MONGO, {
            serverSelectionTimeoutMS: 7000,
        });

        console.log("✅ MongoDB connected successfully");

        const server = app.listen(process.env.PORT || 3000, () => {
            console.log(`🚀 Server running on port ${process.env.PORT || 3000}`);
        });

        server.on("error", (error) => {
            console.error("❌ Server error:", error.message);
            process.exit(1);
        });

        process.on('SIGTERM', () => {
            console.log('🛑 Received SIGTERM. Shutting down...');
            server.close(() => process.exit(0));
        });

        process.on('SIGINT', () => {
            console.log('🛑 SIGINT received (local). Closing gracefully...');
            server.close(() => process.exit(0));
        });

    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        process.exit(1);
    }
};
startServer();
