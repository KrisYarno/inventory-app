// controllers/userController.js
const bcrypt = require('bcrypt');
const User = require('../models/User');

exports.renderSettings = (req, res) => {
  res.render('settings', { error: null, success: null });
};

exports.changePassword = async (req, res) => {
  const userId = req.session.userId;
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.render('settings', { error: 'Passwords do not match', success: null });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.redirect('/login');
    }

    // Verify old password
    const match = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!match) {
      return res.render('settings', { error: 'Incorrect old password', success: null });
    }

    // Update to new password
    const newHash = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(userId, newHash);

    res.render('settings', { error: null, success: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.render('settings', { error: 'An error occurred', success: null });
  }
};
