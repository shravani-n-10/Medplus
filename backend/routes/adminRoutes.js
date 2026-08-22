const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// All admin routes require authMiddleware and admin role
router.use(authMiddleware, roleMiddleware('admin'));

router.get('/users', adminController.getUsers);
router.patch('/users/:userId/approve', adminController.approveUser);
router.patch('/users/:userId/reject', adminController.rejectUser);
router.get('/stats', adminController.getSystemStats);
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
