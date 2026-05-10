const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/auth.controller');
const verifyToken = require('../middleware/auth');

// Public — no token needed
router.post('/register', register);
router.post('/login', login);

// Protected — valid JWT required
router.get('/profile', verifyToken, getProfile);

module.exports = router;
