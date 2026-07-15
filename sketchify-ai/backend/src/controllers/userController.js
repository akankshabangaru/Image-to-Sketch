const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Update current user's profile
// @route   PUT /api/users/me
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatarUrl } = req.body;
  if (name) req.user.name = name;
  if (avatarUrl) req.user.avatarUrl = avatarUrl;
  await req.user.save();
  res.status(200).json({ success: true, user: req.user.toSafeObject() });
});

// @desc    Change password (local accounts only)
// @route   PUT /api/users/me/password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (req.user.authProvider !== 'local') {
    res.status(400);
    throw new Error('Password changes are not available for Google-linked accounts');
  }

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();
  res.status(200).json({ success: true, message: 'Password updated' });
});

// @desc    Delete current user's account
// @route   DELETE /api/users/me
// @access  Private
const deleteAccount = asyncHandler(async (req, res) => {
  await req.user.deleteOne();
  res.cookie('token', 'none', { expires: new Date(Date.now() + 1000), httpOnly: true });
  res.status(200).json({ success: true, message: 'Account deleted' });
});

module.exports = { updateProfile, changePassword, deleteAccount };
