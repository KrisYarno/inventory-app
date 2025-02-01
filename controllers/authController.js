// controllers/authController.js
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Render the login page
exports.getLogin = (req, res) => {
  // If you want to show flash messages, you can retrieve them here
  // const errorMessage = req.flash('error');
  res.render('login', { error: null });
};

// Handle login form submission
exports.postLogin = async (req, res) => {
  // We'll assume you named the form field "usernameOrEmail"
  const { usernameOrEmail, password } = req.body;

  try {
    // Decide if input looks like an email or a username
    let user;
    if (usernameOrEmail.includes('@')) {
      user = await User.findByEmail(usernameOrEmail);
    } else {
      user = await User.findByUsername(usernameOrEmail);
    }

    if (!user) {
      return res.render('login', { error: 'Invalid username/email or password' });
    }

    // Check if user is approved
    if (!user.isApproved) {
      return res.render('login', { error: 'Your account is pending approval' });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.render('login', { error: 'Invalid username/email or password' });
    }

    // Store user info in session
    req.session.userId = user.id;
    req.session.isAdmin = user.isAdmin;

    // redirect to main page
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

/**
 * SIGNUP logic - new method
 * We'll store the user with isApproved=0.
 */
exports.getSignup = (req, res) => {
  res.render('signup', { error: null });
};

exports.postSignup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !password) {
      return res.render('signup', { error: 'Username and password are required' });
    }
    // Email is optional for login, but let's require it for signups if you want:
    // If truly optional, remove or tweak this check
    if (!email) {
      return res.render('signup', { error: 'Email is required' });
    }

    // Check if email or username is in use
    const existingEmailUser = await User.findByEmail(email);
    if (existingEmailUser) {
      return res.render('signup', { error: 'That email is already in use' });
    }

    const existingUsernameUser = await User.findByUsername(username);
    if (existingUsernameUser) {
      return res.render('signup', { error: 'That username is already taken' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create with isApproved=0 by default
    await User.createUserWithEmail({
      username,
      email,
      passwordHash,
      isAdmin: 0,
      isApproved: 0
    });

    // Show a message that admin must approve
    return res.render('login', {
      error: 'Account created. Please wait for admin approval.'
    });
  } catch (err) {
    console.error(err);
    return res.render('signup', {
      error: 'An error occurred. Please try again.'
    });
  }
};
