const express = require('express');
const router = express.Router();
const { applyLeave, getMyLeaves, cancelLeave } = require('../controllers/leave.controller');
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');

// All routes here require: (1) valid JWT, (2) 'employee' role
// Middleware runs left-to-right: verifyToken → requireRole → controller
router.use(verifyToken);
router.use(requireRole('employee'));

router.post('/apply',          applyLeave);
router.get('/my-leaves',       getMyLeaves);
router.patch('/cancel/:id',    cancelLeave);

module.exports = router;
