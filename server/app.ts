require("dotenv").config();

import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import userRouter from "./routes/user.route";
import driverRouter from "./routes/driver.route";
import paymentRouter from "./routes/payment.route";

import Nylas from "nylas";

export const app = express();

console.log("APP FILE LOADED ✅");

// ================= MIDDLEWARE =================
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// 🔥 LOG ALL REQUESTS (VERY IMPORTANT FOR DEBUG)
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`➡️ ${req.method} ${req.originalUrl}`);
  next();
});

// ================= TEST ROUTES =================
app.get("/test", (req: Request, res: Response) => {
  console.log("TEST ROUTE HIT ✅");
  res.json({
    success: true,
    message: "API is working",
  });
});

app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Server is running 🚀",
  });
});

app.get("/api/v1", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "API v1 is working 🚀",
  });
});

// ================= ROUTES =================

// USER + DRIVER
app.use("/api/v1", userRouter);
app.use("/api/v1/driver", driverRouter);

// 🔥 PAYMENT ROUTE
app.use("/api/payment", paymentRouter);

// 🔥 TEST PAYMENT ROUTE (to confirm mount)
app.get("/api/payment/test", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Payment route working ✅",
  });
});

// ================= NYLAS =================
export const nylas = new Nylas({
  apiKey: process.env.NYLAS_API_KEY!,
  apiUri: "https://api.us.nylas.com",
});

// ================= 404 HANDLER =================
app.use((req: Request, res: Response) => {
  console.log("❌ 404 HIT:", req.originalUrl);

  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ================= ERROR HANDLER =================
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("❌ GLOBAL ERROR:", err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});