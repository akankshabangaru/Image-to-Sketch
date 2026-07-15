const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Image = require('../models/Image');

// @desc    High-level platform stats for the admin dashboard
// @route   GET /api/admin/stats
// @access  Private/Admin
const getOverviewStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalImages, completedImages, failedImages] = await Promise.all([
    User.countDocuments(),
    Image.countDocuments(),
    Image.countDocuments({ status: 'completed' }),
    Image.countDocuments({ status: 'failed' }),
  ]);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [imagesToday, imagesThisMonth, newUsersToday, newUsersThisMonth] = await Promise.all([
    Image.countDocuments({ createdAt: { $gte: startOfToday } }),
    Image.countDocuments({ createdAt: { $gte: startOfMonth } }),
    User.countDocuments({ createdAt: { $gte: startOfToday } }),
    User.countDocuments({ createdAt: { $gte: startOfMonth } }),
  ]);

  const styleBreakdown = await Image.aggregate([
    { $group: { _id: '$style', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // Last 14 days of image processing volume, for a trend chart
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const dailyTrend = await Image.aggregate([
    { $match: { createdAt: { $gte: fourteenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalImages,
      completedImages,
      failedImages,
      imagesToday,
      imagesThisMonth,
      newUsersToday,
      newUsersThisMonth,
      mostUsedStyle: styleBreakdown[0]?._id || null,
      styleBreakdown,
      dailyTrend,
    },
  });
});

// @desc    List users with pagination, for user management
// @route   GET /api/admin/users
// @access  Private/Admin
const listUsers = asyncHandler(async (req, res) => {
  const { search, role, page = 1, limit = 20 } = req.query;
  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (role) query.role = role;

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    users: users.map((u) => u.toSafeObject()),
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
  });
});

// @desc    Update a user's role or plan
// @route   PATCH /api/admin/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const { role, plan } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (role) user.role = role;
  if (plan) user.plan = plan;
  await user.save();
  res.status(200).json({ success: true, user: user.toSafeObject() });
});

// @desc    Delete a user (admin action)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  await Image.deleteMany({ user: user._id });
  await user.deleteOne();
  res.status(200).json({ success: true, message: 'User and their images deleted' });
});

module.exports = { getOverviewStats, listUsers, updateUser, deleteUser };
