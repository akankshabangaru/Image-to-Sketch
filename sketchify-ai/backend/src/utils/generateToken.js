const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Sends the JWT both as a JSON field (for SPA header-based auth) and as an
// httpOnly cookie (defense in depth / SSR friendliness)
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id, user.role);
  const cookieExpiresDays = parseInt(process.env.JWT_EXPIRES_IN) || 7;

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: cookieExpiresDays * 24 * 60 * 60 * 1000,
  });

  res.status(statusCode).json({
    success: true,
    token,
    user: user.toSafeObject(),
  });
};

module.exports = { generateToken, sendTokenResponse };
