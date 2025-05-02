// controllers/authController.js
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Render the login page
exports.getLogin = (req, res) => {
  res.render('login', { error: null });
};

// Handle login form submission
exports.postLogin = async (req, res) => {
  const { usernameOrEmail, password, rememberMe } = req.body; // Get rememberMe from body

  try {
      let user;
      if (usernameOrEmail.includes('@')) {
          user = await User.findByEmail(usernameOrEmail);
      } else {
          user = await User.findByUsername(usernameOrEmail);
      }

      if (!user) {
          // Use flash messages for feedback
          req.flash('error', 'Invalid username/email or password');
          return res.redirect('/login');
      }

      if (!user.isApproved) {
           req.flash('error', 'Your account is pending approval');
           return res.redirect('/login');
      }

      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
           req.flash('error', 'Invalid username/email or password');
           return res.redirect('/login');
      }

      // --- NEW: Handle "Remember Me" ---
      if (rememberMe === 'true') {
          // Set cookie maxAge to 1 week (in milliseconds)
          const oneWeek = 7 * 24 * 60 * 60 * 1000;
          req.session.cookie.maxAge = oneWeek;
          console.log(`Setting persistent session for user ${user.id} for 1 week.`); // For debugging
      } else {
          // Set cookie maxAge to null -> becomes session cookie (expires on browser close)
          req.session.cookie.maxAge = null;
          console.log(`Setting session cookie for user ${user.id}.`); // For debugging
      }
      // --- End Handle "Remember Me" ---

      // Regenerate session ID upon login for security (optional but recommended)
      // req.session.regenerate(function(err) {
      //    if (err) { /* handle error */ return next(err); }
      //    // Store user info in session
      //    req.session.userId = user.id;
      //    req.session.isAdmin = user.isAdmin;
      //    req.session.currentLocationId = user.defaultLocationId || 1;
      //    // redirect after regeneration
      //     res.redirect('/inventory');
      // });

      // Store user info in session (without regenerate for now)
      req.session.userId = user.id;
      req.session.isAdmin = user.isAdmin;
      req.session.currentLocationId = user.defaultLocationId || 1;


      // Redirect to main page
      return res.redirect('/inventory');

  } catch (error) {
      console.error('Login error:', error);
      req.flash('error', 'An error occurred during login.');
      return res.redirect('/login');
  }
};

// Handle logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
        console.error('Logout error:', err);
         // Handle error appropriately, maybe render an error page
         // For now, just redirecting
    }
    res.redirect('/login');
  });
};

// --- SIGNUP ---
exports.getSignup = (req, res) => {
  res.render('signup', { error: null });
};

exports.postSignup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !password || !email) { // Made email required for signup
      return res.render('signup', { error: 'Username, email, and password are required' });
    }

    const existingEmailUser = await User.findByEmail(email);
    if (existingEmailUser) {
      return res.render('signup', { error: 'That email is already in use' });
    }

    const existingUsernameUser = await User.findByUsername(username);
    if (existingUsernameUser) {
      return res.render('signup', { error: 'That username is already taken' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create with isApproved=0 by default, defaultLocationId=1
    await User.createUserWithEmail({
      username,
      email,
      passwordHash,
      isAdmin: 0,
      isApproved: 0,
      defaultLocationId: 1 // Explicitly setting default
    });

    return res.render('login', { // Redirect to login with message
      error: null, // Clear previous errors
      // Using a query parameter or flash message might be better long term
      // But for now, let's use the error field repurposed for info
      // Consider changing 'error' template variable to 'message' for flexibility
      infoMessage: 'Account created. Please wait for admin approval.'
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.render('signup', {
      error: 'An error occurred during signup. Please try again.'
    });
  }
};
