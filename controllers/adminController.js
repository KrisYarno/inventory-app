// controllers/adminController.js
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Product = require('../models/Product'); // Uses Product model
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const InventoryLog = require('../models/InventoryLog'); // Uses InventoryLog model
// Location model not directly needed if using res.locals

exports.renderAdminPage = async (req, res) => {
  try {
    // --- UPDATED: Fetch products WITH location details ---
    const productsWithLocations = await Product.getAllProductsWithLocationQuantities();
    // Fetch all users for user management section
    const users = await User.getAllUsers();

    res.render('admin', {
      products: productsWithLocations, // Pass detailed product list
      users,
      // user: req.session, // isAdmin is passed below
      isAdmin: req.session.isAdmin || false, // Pass admin status
       // Location data (allLocations, currentUserLocation) is available via res.locals
       success: req.flash('success'), // Pass flash messages if needed
       error: req.flash('error'),
       page: 'admin' // For navbar active state
    });
  } catch (error) {
    console.error("Error rendering admin page:", error);
    req.flash('error', 'Failed to load admin page.');
    res.redirect('/inventory'); // Or render an error page
  }
};

// Export inventory as CSV - Should this export totals or breakdown?
// Current logic exports totals based on the old products.quantity or calculated total.
// Let's keep it exporting the total quantity for now.
exports.exportInventory = async (req, res) => {
  try {
    // Fetch data suitable for export (can use the detailed fetch and extract totals)
    const productsToExport = await Product.getAllProductsWithLocationQuantities();

    const csvWriter = createCsvWriter({
      path: 'inventory_export.csv', // Consider timestamping filename
      header: [
        { id: 'id', title: 'ID' },
        { id: 'name', title: 'Product Name' },
        { id: 'totalQuantity', title: 'Total Quantity' } // Exporting total quantity
        // Add columns for location breakdown if desired
        // { id: 'locations.1.quantity', title: 'Office Qty'},
        // { id: 'locations.2.quantity', title: 'Derek Qty'},
        // { id: 'locations.3.quantity', title: 'House Qty'},
      ]
    });

    // Prepare records for CSV writer (flattening locations if needed for export breakdown)
    const records = productsToExport.map(p => ({
        id: p.id,
        name: p.name,
        totalQuantity: p.totalQuantity
        // officeQty: p.locations[1]?.quantity || 0, // Example if exporting breakdown
        // derekQty: p.locations[2]?.quantity || 0,
        // houseQty: p.locations[3]?.quantity || 0,
    }));


    await csvWriter.writeRecords(records); // Use mapped records

    // Set appropriate headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename="inventory_export.csv"');
    res.setHeader('Content-Type', 'text/csv');

    res.download('inventory_export.csv', 'inventory_export.csv', (err) => {
        // Optional: Clean up the file after download if needed
        // require('fs').unlinkSync('inventory_export.csv');
      if (err) {
        console.error("Error sending CSV file:", err);
         // If headers already sent, may not be able to send error response
         if (!res.headersSent) {
             res.status(500).send('Error exporting inventory');
         }
      }
    });
  } catch (error) {
    console.error("Error exporting inventory:", error);
     if (!res.headersSent) {
        res.status(500).send('Error exporting inventory');
     }
  }
};


// Render Logs Page (join location name)
exports.renderLogsPage = async (req, res) => {
  try {
    const logs = await InventoryLog.getAllLogs(); // This already joins location name
    res.render('adminLogs', {
        logs,
        isAdmin: req.session.isAdmin || false,
        page: 'logs'
        // Location data available via res.locals if needed
    });
  } catch (error) {
    console.error("Error retrieving logs:", error);
    req.flash('error', 'Failed to load logs.');
    res.redirect('/admin');
  }
};


// Create a new user (legacy) - No changes needed here for locations
exports.createUser = async (req, res) => {
  const { username, password, isAdmin } = req.body;
  const defaultLocId = 1; // Legacy create defaults to Office

  if (!username || !password) {
       req.flash('error', 'Username and password are required for legacy user creation.');
       return res.redirect('/admin'); // Redirect back to admin page
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    // User model's createUser now handles defaultLocationId
    await User.createUser(username, hashed, isAdmin ? 1 : 0, defaultLocId);
    req.flash('success', `Legacy user '${username}' created successfully.`);
    res.redirect('/admin'); // Redirect back, ensuring user sees the new user in the list
  } catch (error) {
    console.error("Error creating legacy user:", error);
     req.flash('error', `Error creating user: ${error.message || 'Please try again.'}`);
     res.redirect('/admin');
  }
};

// Manage user actions - No changes needed here for locations
exports.manageUser = async (req, res) => {
  const { action, userId } = req.body;
  const currentUserId = req.session.userId; // Get current user ID

   // Prevent admin from modifying their own approval/admin status/deletion via this form
   if (parseInt(userId, 10) === currentUserId && (action === 'revokeApproval' || action === 'revokeAdmin' || action === 'delete')) {
      req.flash('error', 'Admins cannot revoke their own privileges or delete themselves via this panel.');
      return res.redirect('/admin');
   }

  try {
    let message = '';
    if (action === 'approve') {
      await User.approveUserById(userId); message = 'User approved.';
    } else if (action === 'revokeApproval') {
      await User.revokeApprovalById(userId); message = 'User approval revoked.';
    } else if (action === 'grantAdmin') {
      await User.grantAdmin(userId); message = 'Admin privileges granted.';
    } else if (action === 'revokeAdmin') {
      await User.revokeAdmin(userId); message = 'Admin privileges revoked.';
    } else if (action === 'delete') {
      await User.deleteUser(userId); message = 'User deleted.';
    } else {
      message = 'Unknown user action.';
    }

    req.flash('success', message);
    res.redirect('/admin');
  } catch (error) {
    console.error(`Error managing user (Action: ${action}, UserID: ${userId}):`, error);
    req.flash('error', `Error managing user: ${error.message || 'Please try again.'}`);
    res.redirect('/admin');
  }
};
