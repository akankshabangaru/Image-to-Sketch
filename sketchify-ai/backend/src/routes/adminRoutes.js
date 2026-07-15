const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getOverviewStats, listUsers, updateUser, deleteUser } = require('../controllers/adminController');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', getOverviewStats);
router.get('/users', listUsers);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
