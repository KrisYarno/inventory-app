// controllers/userController.js
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Location = require('../models/Location');

// Render settings page - Fetch user data for default location
exports.renderSettings = async (req, res) => {
  try {
     // Fetch current user details to get their saved defaultLocationId
     const user = await User.findById(req.session.userId);
     if (!user) {
         req.flash('error', 'Could not find user data.');
         return res.redirect('/inventory');
     }

     // Location data (allLocations, currentUserLocation) is available via res.locals

    res.render('settings', {
        error: req.flash('error'), // Get flash messages
        success: req.flash('success'),
        currentUser: user, // Pass user object containing defaultLocationId
        // allLocations is already available via res.locals from middleware
        isAdmin: req.session.isAdmin || false,
        page: 'settings' // For navbar active state
     });
  } catch(error){
      console.error("Error rendering settings:", error);
      req.flash('error', 'Failed to load settings page.');
      res.redirect('/inventory'); // Or render an error page
  }
};

// Handle password change
exports.changePassword = async (req, res) => {
  const userId = req.session.userId;
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!newPassword || newPassword !== confirmPassword) {
    req.flash('error', 'New passwords do not match.');
    return res.redirect('/user/settings');
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
       req.flash('error', 'User not found.');
       return res.redirect('/login');
    }

    const match = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!match) {
      req.flash('error', 'Incorrect old password.');
      return res.redirect('/user/settings');
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(userId, newHash);

    req.flash('success', 'Password changed successfully.');
    res.redirect('/user/settings');
  } catch (err) {
    console.error('Password change error:', err);
    req.flash('error', 'An error occurred changing password.');
    res.redirect('/user/settings');
  }
};


// Set current location in session
exports.setCurrentLocation = async (req, res) => {
    const { locationId } = req.body;
    const parsedLocationId = parseInt(locationId, 10);

    if (isNaN(parsedLocationId)) {
        return res.status(400).json({ success: false, message: 'Invalid location ID.' });
    }

    try {
        const locationExists = await Location.findById(parsedLocationId);
        if (!locationExists) {
             return res.status(400).json({ success: false, message: 'Selected location does not exist.' });
        }
        req.session.currentLocationId = parsedLocationId;
        res.json({ success: true, newLocationId: parsedLocationId });
    } catch (error) {
        console.error("Error setting location:", error);
        res.status(500).json({ success: false, message: 'Failed to update location.' });
    }
};

// --- NEW: Controller function to update persistent default location ---
exports.updateDefaultLocation = async (req, res) => {
    const { newLocationId } = req.body;
    const userId = req.session.userId;
    const parsedLocationId = parseInt(newLocationId, 10);

    // Validate input
    if (isNaN(parsedLocationId)) {
        req.flash('error', 'Invalid location selected.');
        return res.redirect('/user/settings');
    }
     if (!userId) {
        req.flash('error', 'Authentication error.');
        return res.redirect('/login');
    }

    try {
         // Optional: Validate location ID exists using Location model
        const locationExists = await Location.findById(parsedLocationId);
        if (!locationExists) {
            req.flash('error', 'Invalid location selected.');
            return res.redirect('/user/settings');
        }

        // Update the user's default location in the database
        await User.updateDefaultLocation(userId, parsedLocationId);

        // Update session location *if* user wants it to change immediately?
        // req.session.currentLocationId = parsedLocationId; // Optional: sync session too
        // For now, just update the default. Session will update on next login.

        req.flash('success', 'Default login location updated successfully.');
        res.redirect('/user/settings');

    } catch (error) {
        console.error(`Error updating default location for user ${userId}:`, error);
        req.flash('error', 'Failed to update default location.');
        res.redirect('/user/settings');
    }
};