// controllers/inventoryController.js
const Product = require('../models/Product.js'); // Ensure correct model path

// Render the main inventory adjustment page
exports.renderInventoryPage = async (req, res) => {
  try {
    // Fetch only product IDs and names needed for the form
    const products = await Product.getAllProducts();

    res.render('inventory', {
      products, // Just the list of products {id, name}
      // --- FIXED: Pass isAdmin status from session ---
      isAdmin: req.session.isAdmin || false, // Pass admin status, default to false if not set
      // Note: Location data (currentUserLocation, allLocations) is available via res.locals from middleware
      successMessage: req.flash('success'),
       // Optional: Pass page identifier for navbar active state
      page: 'inventory'
    });
  } catch (error) {
    console.error('Error rendering inventory page:', error);
    req.flash('error', 'Failed to load inventory page.');
    res.status(500).send('Internal Server Error'); // Or redirect
  }
};

// Handle the submission of inventory adjustments
exports.updateInventory = async (req, res) => {
  const userId = req.session.userId;
  const locationId = req.session.currentLocationId;

  if (!locationId) {
      console.error(`User ${userId} attempted inventory update without a location set in session.`);
      req.flash('error', 'Your current location is not set. Please select a location.');
      return res.redirect('/inventory');
  }
  // Ensure userId exists as well
  if (!userId) {
       console.error(`Attempted inventory update without a userId in session.`);
       req.flash('error', 'Authentication error. Please log in again.');
       return res.redirect('/login');
  }


  try {
    const { productId, quantityChange } = req.body;

    const productIds = Array.isArray(productId) ? productId : [productId];
    const quantityChanges = Array.isArray(quantityChange) ? quantityChange : [quantityChange];

    const updates = productIds
      .map((id, index) => ({
        productId: parseInt(id, 10),
        delta: parseInt(quantityChanges[index], 10)
      }))
      .filter(update => !isNaN(update.productId) && !isNaN(update.delta) && update.delta !== 0);


    if (updates.length > 0) {
        await Product.updateProductLocationQuantity(updates, userId, locationId);
        req.flash('success', 'Inventory changes saved successfully!');
    } else {
         req.flash('info', 'No changes were submitted.');
    }

    res.redirect('/inventory');

  } catch (error) {
    console.error(`Error updating inventory for location ${locationId} by user ${userId}:`, error);
    req.flash('error', `Error updating inventory: ${error.message || 'Please try again.'}`);
    res.redirect('/inventory'); // Redirect back even on error
  }
};
