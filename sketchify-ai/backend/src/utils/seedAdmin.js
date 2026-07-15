// Run with: npm run seed:admin
// Creates a default admin user for first login.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

(async () => {
  await connectDB();
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@sketchify.ai';
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin already exists:', email);
    process.exit(0);
  }
  await User.create({
    name: 'Sketchify Admin',
    email,
    password: process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!',
    role: 'admin',
    isVerified: true,
  });
  console.log('Admin user created:', email);
  process.exit(0);
})();
