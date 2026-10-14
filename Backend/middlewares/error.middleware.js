import { ApiError } from "../utils/ApiError.js";

export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || 500;
    let message = error.message || "Something went wrong";

    if (error.name === "ValidationError") {
      statusCode = 400;
    } else if (error.name === "CastError") {
      statusCode = 400;
      message = `Invalid ${error.path || "field"}: ${error.value}`;
    } else if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      statusCode = 401;
      message = error.message || "Invalid or expired token";
    }

    error = new ApiError(
      statusCode,
      message,
      error?.errors || [],
      err.stack
    );
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    error = new ApiError(409, `Duplicate value entered for ${field}`);
  }

  const response = {
    statusCode: error.statusCode,
    success: false,
    message: error.message,
    errors: error.errors,
    data: null,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  };

  return res.status(error.statusCode).json(response);
};
