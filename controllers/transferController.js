// controllers/transferController.js
const Product = require('../models/Product.js');
// No need to require Location model directly here if using res.locals from middleware

/**
 * Renders the transfer inventory page.
 */
exports.renderTransferPage = async (req, res) => {
    try {
        // Fetch all products with their location breakdowns
        const productsWithLocations = await Product.getAllProductsWithLocationQuantities();

        res.render('transfer', {
            products: productsWithLocations,
            // Location data (allLocations, currentUserLocation) is available via res.locals
            isAdmin: req.session.isAdmin || false,
            success: req.flash('success'),
            error: req.flash('error'),
            page: 'transfer' // For navbar active state
        });
    } catch (error) {
        console.error("Error rendering transfer page:", error);
        req.flash('error', 'Failed to load transfer page.');
        res.redirect('/inventory'); // Redirect somewhere sensible on error
    }
};

/**
 * Handles the submission of the transfer inventory form.
 */
exports.handleTransfer = async (req, res) => {
    const { productId, quantity, fromLocationId, toLocationId } = req.body;
    const userId = req.session.userId;

    // Basic Input Validation
    const transferQuantity = parseInt(quantity, 10);
    const prodId = parseInt(productId, 10);
    const fromLocId = parseInt(fromLocationId, 10);
    const toLocId = parseInt(toLocationId, 10);

    if (isNaN(transferQuantity) || transferQuantity <= 0) {
        req.flash('error', 'Please enter a valid positive quantity to transfer.');
        return res.redirect('/transfer');
    }
    if (isNaN(prodId) || isNaN(fromLocId) || isNaN(toLocId)) {
         req.flash('error', 'Invalid product or location selected.');
         return res.redirect('/transfer');
    }
     if (fromLocId === toLocId) {
         req.flash('error', 'Source and destination locations must be different.');
         return res.redirect('/transfer');
    }
    if (!userId) {
        req.flash('error', 'Authentication error. Please log in again.');
        return res.redirect('/login');
    }


    try {
        await Product.transferQuantity(prodId, transferQuantity, fromLocId, toLocId, userId);
        req.flash('success', `Successfully transferred ${transferQuantity} units of product ID ${prodId} from location ${fromLocId} to ${toLocId}.`);
        res.redirect('/transfer');
    } catch (error) {
        console.error(`Transfer Error (User: ${userId}, Product: ${prodId}, Qty: ${transferQuantity}, From: ${fromLocId}, To: ${toLocId}):`, error);
        req.flash('error', `Transfer failed: ${error.message}`);
        res.redirect('/transfer');
    }
};