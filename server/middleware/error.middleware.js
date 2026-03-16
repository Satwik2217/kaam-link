import ApiError from '../utils/ApiError.js';

/**
 * 404 Not Found handler for undefined routes.
 */
export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Global error handling middleware.
 * Handles Mongoose errors, JWT errors, and custom ApiErrors.
 * In production, don't leak stack traces.
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // --- Mongoose Errors ---
  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    error.statusCode = 400;
    error.message = `Invalid ${err.path}: ${err.value}. Please provide a valid ID.`;
  }

  // Mongoose Duplicate Key Error (e.g., phone or email already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    error.statusCode = 409;
    error.message = `An account with ${field} '${value}' already exists. Please use a different ${field} or log in.`;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    error.statusCode = 400;
    error.message = `Validation failed: ${messages.join('. ')}`;
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ ERROR:', {
      statusCode: error.statusCode,
      message: error.message,
      stack: err.stack,
    });
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

