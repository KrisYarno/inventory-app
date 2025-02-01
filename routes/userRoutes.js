// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

function ensureAuth(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

router.get('/settings', ensureAuth, userController.renderSettings);
router.post('/change-password', ensureAuth, userController.changePassword);

module.exports = router;
