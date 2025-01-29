// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController.js');

function ensureAdmin(req, res, next) {
  if (!req.session.userId || !req.session.isAdmin) {
    return res.redirect('/login');
  }
  next();
}

// GET /admin
router.get('/', ensureAdmin, adminController.renderAdminPage);

// GET /admin/export
router.get('/export', ensureAdmin, adminController.exportInventory);

// POST /admin/users
router.post('/users', ensureAdmin, adminController.createUser);

// NEW: GET /admin/logs
router.get('/logs', ensureAdmin, adminController.renderLogsPage);

module.exports = router;
