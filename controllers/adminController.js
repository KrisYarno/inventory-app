// controllers/adminController.js
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Product = require('../models/Product');
const InventoryLog = require('../models/inventorylog');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Render Admin page with full inventory list
exports.renderAdminPage = async (req, res) => {
  try {
    const products = await Product.getAllProducts();
    res.render('admin', { products, user: req.session });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

// Export inventory as CSV
exports.exportInventory = async (req, res) => {
  try {
    const products = await Product.getAllProducts();

    // Create a CSV file in memory or on disk. 
    // For simplicity, we'll create it in a temp folder
    const csvWriter = createCsvWriter({
      path: 'inventory_export.csv',
      header: [
        { id: 'id', title: 'ID' },
        { id: 'name', title: 'Product Name' },
        { id: 'quantity', title: 'Quantity' }
      ]
    });

    await csvWriter.writeRecords(products);

    // Send file to client
    res.download('inventory_export.csv', 'inventory_export.csv', (err) => {
      if (err) {
        console.error(err);
      }
      // Optionally, delete the file after sending
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error exporting inventory');
  }
};

// Log Changes
exports.renderLogsPage = async (req, res) => {
  try {
    const logs = await InventoryLog.getAllLogs();
    // logs have structure: 
    // [{id, changeTime, delta, changedBy, productName}, ...]

    res.render('adminLogs', { logs, user: req.session });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving logs');
  }
};

// Create a new user (Admin only)
exports.createUser = async (req, res) => {
  const { username, password, isAdmin } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    await User.createUser(username, hashed, isAdmin ? 1 : 0);
    res.redirect('/admin');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating user');
  }
};
