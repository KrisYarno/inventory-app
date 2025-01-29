// routes/inventoryRoutes.js
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController.js');

// Middleware to ensure user is logged in
function ensureAuth(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

// GET /inventory
router.get('/', ensureAuth, inventoryController.renderInventoryPage);

// POST /inventory/update
router.post('/update', ensureAuth, inventoryController.updateInventory);

module.exports = router;
