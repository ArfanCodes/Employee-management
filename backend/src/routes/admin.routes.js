const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getAllLeaves,
  approveLeave,
  rejectLeave,
  getDashboardStats
} = require('../controllers/admin.controller');
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');

// Double-lock: JWT authentication + admin role check on every route in this file
router.use(verifyToken);
router.use(requireRole('admin'));

router.get('/employees',              getAllEmployees);
router.get('/leaves',                 getAllLeaves);
router.patch('/leaves/:id/approve',   approveLeave);
router.patch('/leaves/:id/reject',    rejectLeave);
router.get('/dashboard/stats',        getDashboardStats);

module.exports = router;
