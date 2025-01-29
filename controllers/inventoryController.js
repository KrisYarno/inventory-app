// controllers/inventoryController.js
const Product = require('../models/Product');

exports.renderInventoryPage = async (req, res) => {
  try {
    const products = await Product.getAllProducts();
    // Retrieve any flashed success messages (if any)
    const successMessage = req.flash('success');
    res.render('inventory', { 
      products, 
      user: req.session, 
      successMessage  // pass this to the template
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

exports.updateInventory = async (req, res) => {
  try {
    const { productId, quantityChange } = req.body;
    const userId = req.session.userId;  // the logged-in user's ID

    const productIds = Array.isArray(productId) ? productId : [productId];
    const quantityChanges = Array.isArray(quantityChange) ? quantityChange : [quantityChange];

    const updates = productIds.map((id, index) => ({
      productId: parseInt(id, 10),
      delta: parseInt(quantityChanges[index], 10)
    }));

    await Product.updateProductQuantities(updates, userId);

    // <-- Set a flash message indicating success
    req.flash('success', 'Inventory changes saved successfully!');

    // Then redirect back to the inventory page
    res.redirect('/inventory');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating inventory');
  }
};
