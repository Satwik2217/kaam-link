import jwt from 'jsonwebtoken';

/**
 * Generates a JWT token and sets it as an HttpOnly cookie.
 * Also returns the token for API clients that don't use cookies.
 *
 * @param {Object} res - Express response object
 * @param {String} userId - MongoDB User ObjectId
 * @param {String} role - User role ('worker', 'employer', 'admin')
 * @returns {String} - The signed JWT token string
 */
export const generateTokenAndSetCookie = (res, userId, role) => {
  const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  const cookieOptions = {
    httpOnly: true, // Prevents client-side JS from accessing the cookie (XSS protection)
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    // For cross-origin requests (frontend ↔ backend on different ports), the cookie
    // needs SameSite=None to be sent with XHR/fetch.
    // Note: Browsers typically require secure cookies when SameSite=None.
    // During local development (HTTP), we allow it to work by using None without secure.
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/',
  };

  res.cookie('kaamlink_jwt', token, cookieOptions);
  return token;
};

/**
 * Clears the JWT cookie (for logout).
 */
export const clearTokenCookie = (res) => {
  res.cookie('kaamlink_jwt', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: 0,
    path: '/',
  });
};

