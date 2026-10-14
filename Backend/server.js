import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import connectDB from "./config/db.js";

import userRouter from "./routes/user.routes.js";
import profileRouter from "./routes/profile.routes.js";
import companyRouter from "./routes/company.routes.js";
import jobRouter from "./routes/job.routes.js";
import applicationRouter from "./routes/application.routes.js";
import savedJobRouter from "./routes/savedJob.routes.js";
import interviewRouter from "./routes/interview.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import adminRouter from "./routes/admin.routes.js";

import { errorHandler } from "./middlewares/error.middleware.js";
import { ApiError } from "./utils/ApiError.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

// Global Middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// API Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/profiles", profileRouter);
app.use("/api/v1/companies", companyRouter);
app.use("/api/v1/jobs", jobRouter);
app.use("/api/v1/applications", applicationRouter);
app.use("/api/v1/saved-jobs", savedJobRouter);
app.use("/api/v1/interviews", interviewRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/admin", adminRouter);

// React frontend build directory
const frontendDist = path.resolve(__dirname, "../frontend/dist");

// Serve React static files (JS, CSS, images, etc.)
app.use(express.static(frontendDist));

// Handle React routes and unknown API routes
app.use((req, res, next) => {
  // Unknown API routes should return 404, not React HTML
  if (req.path.startsWith("/api/")) {
    return next(
      new ApiError(404, `Route ${req.originalUrl} not found on this server`),
    );
  }

  // Only use the React fallback for browser page requests
  if (req.method !== "GET") {
    return next(
      new ApiError(404, `Route ${req.originalUrl} not found on this server`),
    );
  }

  const indexPath = path.join(frontendDist, "index.html");

  if (!fs.existsSync(indexPath)) {
    return next(new ApiError(404, "Frontend build not found"));
  }

  res.sendFile(indexPath);
});

// Global Error Handler (must remain last)
app.use(errorHandler);

// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
