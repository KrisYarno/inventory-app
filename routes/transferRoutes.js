// routes/transferRoutes.js
const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transferController');

// Middleware to ensure user is logged in (copy or import from userRoutes)
function ensureAuth(req, res, next) {
  if (!req.session.userId) {
    // Send JSON error for AJAX requests, redirect for others
    if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
         return res.status(401).json({ success: false, message: 'Authentication required.' });
    } else {
        req.flash('error', 'Please log in to view that page.');
        return res.redirect('/login');
    }
  }
  next();
}

// GET /transfer - Display the transfer page
router.get('/', ensureAuth, transferController.renderTransferPage);

// POST /transfer - Handle the transfer form submission
router.post('/', ensureAuth, transferController.handleTransfer);


module.exports = router;