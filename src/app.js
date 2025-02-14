import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import courseRoutes from "./routes/courseRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import cors from "cors";

dotenv.config();



const app = express();
app.use(express.json());

app.use(cors());
app.use(express.json());

// Middleware
app.use(express.json());

// Routes
app.use("/api/courses", courseRoutes);
app.use("/api/payment", paymentRoutes);

// // Database connection
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.error("MongoDB connection error:", err));

export default app;