// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Middleware to ensure user is Admin
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

// POST /admin/users (old create user)
router.post('/users', ensureAdmin, adminController.createUser);

// POST /admin/manage-user (approve, revoke, grant admin, delete, etc.)
router.post('/manage-user', ensureAdmin, adminController.manageUser);

// GET Inventory Logs
router.get('/logs', ensureAdmin, adminController.renderLogsPage);

module.exports = router;
