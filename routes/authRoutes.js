// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// GET /login
router.get('/login', authController.getLogin);

// POST /login
router.post('/login', authController.postLogin);

// GET /logout
router.get('/logout', authController.logout);

module.exports = router;
