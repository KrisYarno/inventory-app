// controllers/authController.js
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Render the login page
exports.getLogin = (req, res) => {
  // Pass error as null initially
  res.render('login', { error: null });
};

// Handle login form submission
exports.postLogin = async (req, res) => {
  const { username, password, remember } = req.body;

  try {
    const user = await User.findByUsername(username);
    if (!user) {
      return res.render('login', { error: 'Invalid username or password' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.render('login', { error: 'Invalid username or password' });
    }

    // Store user info in session
    req.session.userId = user.id;
    req.session.isAdmin = user.isAdmin;

    // "Remember me" logic:
    if (remember === 'true') {
      // 7 days in milliseconds
      req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000;
    } else {
      // If not "Remember me", expire on browser close
      req.session.cookie.expires = false;
      // OR you could set a shorter TTL, e.g. 1 hour, if desired:
      // req.session.cookie.maxAge = 60 * 60 * 1000; 
    }

    return res.redirect('/inventory');
  } catch (error) {
    console.error(error);
    return res.render('login', { error: 'An error occurred' });
  }
};

// Handle logout
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};
