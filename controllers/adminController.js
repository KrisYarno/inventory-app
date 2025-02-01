// controllers/adminController.js
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Product = require('../models/Product');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

exports.renderAdminPage = async (req, res) => {
  try {
    // 1) Get products (for the inventory table)
    const products = await Product.getAllProducts();
    // 2) Get all users (for user management)
    const users = await User.getAllUsers();

    res.render('admin', {
      products,
      users,      // pass user list
      user: req.session
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

// Export inventory as CSV
exports.exportInventory = async (req, res) => {
  try {
    const products = await Product.getAllProducts();
    const csvWriter = createCsvWriter({
      path: 'inventory_export.csv',
      header: [
        { id: 'id', title: 'ID' },
        { id: 'name', title: 'Product Name' },
        { id: 'quantity', title: 'Quantity' }
      ]
    });

    await csvWriter.writeRecords(products);

    res.download('inventory_export.csv', 'inventory_export.csv', (err) => {
      if (err) {
        console.error(err);
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error exporting inventory');
  }
};

// controllers/adminController.js
const InventoryLog = require('../models/InventoryLog');

exports.renderLogsPage = async (req, res) => {
  try {
    const logs = await InventoryLog.getAllLogs();
    // Pass logs + session user info
    res.render('adminLogs', { logs, user: req.session });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving logs');
  }
};


// Create a new user (existing feature)
exports.createUser = async (req, res) => {
  const { username, password, isAdmin } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    // This old method doesn't store email or isApproved,
    // but we keep it for legacy reasons as requested.
    await User.createUser(username, hashed, isAdmin ? 1 : 0);

    res.redirect('/admin');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating user');
  }
};

// Handle user management actions (approve, revoke, grant admin, revoke admin, delete)
exports.manageUser = async (req, res) => {
  const { action, userId } = req.body;

  try {
    if (action === 'approve') {
      await User.approveUserById(userId);
    } else if (action === 'revokeApproval') {
      await User.revokeApprovalById(userId);
    } else if (action === 'grantAdmin') {
      await User.grantAdmin(userId);
    } else if (action === 'revokeAdmin') {
      await User.revokeAdmin(userId);
    } else if (action === 'delete') {
      await User.deleteUser(userId);
    }

    res.redirect('/admin');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error managing user');
  }
};
