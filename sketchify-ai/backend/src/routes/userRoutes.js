const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateProfile, changePassword, deleteAccount } = require('../controllers/userController');

const router = express.Router();

router.use(protect);

router.put('/me', [body('name').optional().trim().notEmpty()], validate, updateProfile);

router.put(
  '/me/password',
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  changePassword
);

router.delete('/me', deleteAccount);

module.exports = router;
