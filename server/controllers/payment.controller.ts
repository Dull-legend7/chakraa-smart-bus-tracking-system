import { Request, Response } from "express";
import crypto from "crypto";
import { razorpay } from "../utils/razorpay";

// ================= CREATE ORDER =================
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    console.log("💰 Creating Razorpay Order:", amount);

    const order = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    res.status(200).json({
      success: true,
      order,
    });
  } catch (err: any) {
    console.error("❌ CREATE ORDER ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Order creation failed",
      error: err.message,
    });
  }
};

// ================= VERIFY PAYMENT =================
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
    }

    // 🔐 Signature verification
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      console.log("✅ PAYMENT VERIFIED");

      // 👉 HERE you will later:
      // save booking to Firebase / DB

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
      });
    } else {
      console.log("❌ INVALID SIGNATURE");

      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }
  } catch (err: any) {
    console.error("❌ VERIFY ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Verification failed",
      error: err.message,
    });
  }
};