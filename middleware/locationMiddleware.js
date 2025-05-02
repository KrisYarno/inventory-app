// middleware/locationMiddleware.js
const Location = require('../models/Location');

/**
 * Middleware to fetch location data and make it available to views.
 */
async function loadLocationData(req, res, next) {
  // Make sure these are initialized even if user isn't logged in or error occurs
  res.locals.allLocations = [];
  res.locals.currentUserLocation = null;

  // Only proceed if user is logged in
  if (req.session && req.session.userId) {
    try {
      const allLocations = await Location.getAll();
      res.locals.allLocations = allLocations;

      // Ensure currentLocationId exists in session, default if not
      if (typeof req.session.currentLocationId === 'undefined' || req.session.currentLocationId === null) {
         // Attempt to fetch user's default if session is missing it
         // This is a fallback, login should ideally set it correctly
         const User = require('../models/User'); // Lazy require to avoid circular deps if needed
         const user = await User.findById(req.session.userId);
         req.session.currentLocationId = user ? user.defaultLocationId : 1; // Default to 1 if user not found
      }

      const currentLocationId = parseInt(req.session.currentLocationId, 10);

      // Find the name of the current location
      const currentLocation = allLocations.find(loc => loc.id === currentLocationId);

      res.locals.currentUserLocation = currentLocation || { id: currentLocationId, name: 'Unknown' }; // Provide fallback name

    } catch (error) {
      console.error("Error loading location data:", error);
      // Decide how to handle error: proceed without location data, render error page, etc.
      // For now, we'll proceed but log the error. `res.locals` will have empty/null values.
    }
  }
  next(); // Proceed to the next middleware or route handler
}

module.exports = loadLocationData;