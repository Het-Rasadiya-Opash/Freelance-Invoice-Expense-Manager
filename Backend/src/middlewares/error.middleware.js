import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || (error.name === "ValidationError" ? 400 : 500);
    const message = error.message || "Internal Server Error";

    if (error.name === "CastError") {
      error = new ApiError(400, `Invalid ${error.path}: ${error.value}`);
    } else if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      error = new ApiError(409, `Duplicate value for field: ${field}`);
    } else {
      error = new ApiError(statusCode, message, [], err.stack);
    }
  }

  const response = {
    success: false,
    message: error.message,
    errors: error.errors,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  };

  if (process.env.NODE_ENV === "development") {
    console.error(err);
  }

  res.status(error.statusCode).json(response);
};

export default errorHandler;
