import express from "express";
import {
  getAllRides,
  getDriversById,
  getLoggedInDriverData,
  newRide,
  sendingOtpToPhone,
  updateDriverStatus,
  updatingRideStatus,
  verifyingEmailOtp,
  verifyPhoneOtpForLogin,
  verifyPhoneOtpForRegistration,
  sendingOtpToEmail, // 🔥 ADD THIS
} from "../controllers/driver.controller";

import { isAuthenticatedDriver } from "../middleware/isAuthenticated";

const driverRouter = express.Router();

/* 🔥 PHONE OTP */
driverRouter.post("/send-otp", sendingOtpToPhone);
driverRouter.post("/login", verifyPhoneOtpForLogin);
driverRouter.post("/verify-otp", verifyPhoneOtpForRegistration);

/* 🔥 EMAIL OTP FLOW (FIXED) */
driverRouter.post("/email-otp-request", sendingOtpToEmail); // ✅ SEND OTP
driverRouter.put("/email-otp-verify", verifyingEmailOtp);   // ✅ VERIFY OTP

/* ❌ REMOVE THIS WRONG LINE */
// driverRouter.post("/registration-driver", verifyingEmailOtp);

/* 🔥 DRIVER DATA */
driverRouter.get("/me", isAuthenticatedDriver, getLoggedInDriverData);
driverRouter.get("/get-drivers-data", getDriversById);

/* 🔥 STATUS */
driverRouter.put("/update-status", isAuthenticatedDriver, updateDriverStatus);

/* 🔥 RIDES */
driverRouter.post("/new-ride", isAuthenticatedDriver, newRide);
driverRouter.put(
  "/update-ride-status",
  isAuthenticatedDriver,
  updatingRideStatus
);
driverRouter.get("/get-rides", isAuthenticatedDriver, getAllRides);

export default driverRouter;