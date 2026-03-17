import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';

/**
 * Protects routes by verifying the JWT token.
 * Checks both the HttpOnly cookie and the Authorization header (Bearer token).
 * Attaches the authenticated user to req.user.
 */
export const protect = async (req, res, next) => {
  let token;

  // 1. Try to get token from HttpOnly cookie
  if (req.cookies && req.cookies.kaamlink_jwt) {
    token = req.cookies.kaamlink_jwt;
  }
  // 2. Fallback: Try Authorization header (for mobile/API clients)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError(401, 'Not authorized. Please log in.'));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user from DB (excludes password due to `select: false`)
    const user = await User.findById(decoded.userId).select('-password -otp');

    if (!user) {
      return next(new ApiError(401, 'User belonging to this token no longer exists.'));
    }

    if (!user.isActive) {
      return next(new ApiError(403, 'Your account has been deactivated. Please contact support.'));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Your session has expired. Please log in again.'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Invalid token. Please log in again.'));
    }
    next(error);
  }
};

/**
 * Authorizes access based on user roles.
 * Must be used after the protect middleware.
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authorized. Please log in.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, `User role ${req.user.role} is not authorized to access this route.`));
    }

    next();
  };
};

