// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

function ensureAuth(req, res, next) {
    if (!req.session.userId) {
        // Send JSON error for AJAX requests, redirect for others
        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        } else {
            req.flash('error', 'Please log in to view that page.'); // Add flash message for redirects
            return res.redirect('/login');
        }
    }
    next();
}

// GET Settings page
router.get('/settings', ensureAuth, userController.renderSettings);

// POST Change password action
router.post('/change-password', ensureAuth, userController.changePassword);

// POST Set current session location action
router.post('/set-location', ensureAuth, userController.setCurrentLocation);

// --- NEW: Update persistent default location action ---
router.post('/update-default-location', ensureAuth, userController.updateDefaultLocation);


module.exports = router;