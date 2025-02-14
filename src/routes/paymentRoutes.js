import express from "express";
import { createPayment, handlePaymentCallback } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-payment", createPayment);
router.post("/payment-callback", handlePaymentCallback);

export default router;