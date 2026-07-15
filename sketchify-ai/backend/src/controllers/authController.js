const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendTokenResponse } = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({ name, email, password, authProvider: 'local' });
  sendTokenResponse(user, 201, res);
});

// @desc    Login with email/password
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || user.authProvider !== 'local') {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  user.lastLoginAt = new Date();
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Log the current user out (clears auth cookie)
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', { expires: new Date(Date.now() + 1000), httpOnly: true });
  res.status(200).json({ success: true, message: 'Logged out' });
});

// @desc    Exchange a Google ID token for a Sketchify session
// @route   POST /api/auth/google
// @access  Public
// NOTE: Requires GOOGLE_CLIENT_ID configured. Verifies the token server-side
// using Google's public keys via the google-auth-library in production; here
// we document the exact contract the frontend (Google Identity Services) sends.
const googleAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body; // ID token from Google Identity Services (frontend)

  if (!process.env.GOOGLE_CLIENT_ID) {
    res.status(501);
    throw new Error(
      'Google auth is not configured on this server. Set GOOGLE_CLIENT_ID/SECRET in .env.'
    );
  }

  if (!credential) {
    res.status(400);
    throw new Error('Missing Google credential token');
  }

  // In production: verify `credential` with google-auth-library's OAuth2Client.verifyIdToken()
  // const ticket = await client.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
  // const payload = ticket.getPayload();
  const payload = jwt.decode(credential); // decode only - swap for verifyIdToken() in production

  if (!payload?.email) {
    res.status(401);
    throw new Error('Invalid Google credential');
  }

  let user = await User.findOne({ email: payload.email });
  if (!user) {
    user = await User.create({
      name: payload.name || payload.email.split('@')[0],
      email: payload.email,
      authProvider: 'google',
      googleId: payload.sub,
      avatarUrl: payload.picture,
      isVerified: true,
    });
  }

  user.lastLoginAt = new Date();
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Request a password reset email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Always respond the same way to avoid leaking which emails are registered
  const genericResponse = {
    success: true,
    message: 'If an account exists for that email, a reset link has been sent.',
  };

  if (!user || user.authProvider !== 'local') {
    return res.status(200).json(genericResponse);
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 min
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(
    user.email
  )}`;

  await sendEmail({
    to: user.email,
    subject: 'Reset your Sketchify AI password',
    html: `<p>You requested a password reset.</p><p><a href="${resetUrl}">Click here to reset your password</a>. This link expires in 30 minutes.</p><p>If you didn't request this, you can ignore this email.</p>`,
  });

  res.status(200).json(genericResponse);
});

// @desc    Reset password using the emailed token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { email, token, password } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    email,
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) {
    res.status(400);
    throw new Error('Reset link is invalid or has expired');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Get the logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user.toSafeObject() });
});

module.exports = { register, login, logout, googleAuth, forgotPassword, resetPassword, getMe };
