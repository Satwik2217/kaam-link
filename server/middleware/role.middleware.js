import ApiError from '../utils/ApiError.js';

/**
 * Role-based access control middleware factory.
 * Usage: restrictTo('admin', 'employer')
 * Must be used AFTER the protect middleware.
 *
 * @param {...String} roles - Allowed roles
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access denied. This action requires one of the following roles: ${roles.join(', ')}.`
        )
      );
    }
    next();
  };
};

