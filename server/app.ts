require("dotenv").config();

import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route";
import driverRouter from "./routes/driver.route";
import Nylas from "nylas";

export const app = express();

console.log("APP FILE LOADED ✅");

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

// 🔥 TEST FIRST (before routers)
app.get("/test", (req: Request, res: Response) => {
  console.log("TEST ROUTE HIT ✅");
  res.json({
    success: true,
    message: "API is working",
  });
});

// Root
app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Server is running 🚀",
  });
});

// API base
app.get("/api/v1", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "API v1 is working 🚀",
  });
});

// 🔥 Mount routers AFTER test
app.use("/api/v1", userRouter);
app.use("/api/v1/driver", driverRouter);

// Nylas
export const nylas = new Nylas({
  apiKey: process.env.NYLAS_API_KEY!,
  apiUri: "https://api.us.nylas.com",
});