// models/Product.js
const db = require('../config/db');
const InventoryLog = require('./InventoryLog'); // Import the log model

module.exports = {
    /**
     * Gets basic product list (id, name) suitable for forms.
     * UPDATED: Sorts by new columns but still selects original name for display.
     */
    getAllProducts: async () => {
        // Select columns needed for display/forms, order by new sorting columns
        const sql = `
            SELECT id, name, baseName, variant, numericValue, unit
            FROM products
            ORDER BY baseName ASC, numericValue ASC, variant ASC, name ASC
        `;
        const [rows] = await db.execute(sql);
        return rows;
    },

    /**
    * Gets a single product's details along with its quantity breakdown by location.
    * Calculates total quantity dynamically.
    * No sorting change needed here as it fetches a single product.
    * @param {number} productId
    * @returns {Promise<object|null>} Product details with location quantities or null if not found.
    */
    getProductWithLocationQuantities: async (productId) => {
        // Include new columns in product selection
        const productSql = 'SELECT id, name, baseName, variant, numericValue, unit FROM products WHERE id = ?';
        const locationSql = `
         SELECT pl.locationId, pl.quantity, loc.name as locationName
         FROM product_locations pl
         JOIN locations loc ON pl.locationId = loc.id
         WHERE pl.productId = ?
         ORDER BY pl.locationId;
     `;

        const [productRows] = await db.execute(productSql, [productId]);
        if (productRows.length === 0) {
            return null; // Product not found
        }

        const product = productRows[0];
        const [locationRows] = await db.execute(locationSql, [productId]);

        let totalQuantity = 0;
        const locations = {}; // Object to hold quantities keyed by locationId

        const Location = require('./Location');
        const allDbLocations = await Location.getAll();
        allDbLocations.forEach(loc => {
             locations[loc.id] = { quantity: 0, locationName: loc.name };
        });

        locationRows.forEach(row => {
            totalQuantity += row.quantity;
            if (locations[row.locationId]) {
                 locations[row.locationId].quantity = row.quantity;
            } else {
                 locations[row.locationId] = { quantity: row.quantity, locationName: `Unknown Location ${row.locationId}`};
            }
        });

        product.totalQuantity = totalQuantity;
        product.locations = locations;

        return product;
    },

    /**
    * Gets all products with their quantity breakdown by location.
    * Calculates total quantity dynamically for each product.
    * UPDATED: Sorts by new columns.
    * (Used for Admin Overview / Transfer Page)
    */
    getAllProductsWithLocationQuantities: async () => {
        // Select new columns and apply new sorting order
        const productsSql = `
            SELECT id, name, baseName, variant, numericValue, unit
            FROM products
            ORDER BY baseName ASC, numericValue ASC, variant ASC, name ASC
        `;
        const locationsSql = `
             SELECT pl.productId, pl.locationId, pl.quantity, loc.name as locationName
             FROM product_locations pl
             JOIN locations loc ON pl.locationId = loc.id
             ORDER BY pl.productId, pl.locationId;
         `;

        const [products] = await db.execute(productsSql);
        const [locationsData] = await db.execute(locationsSql);

        const Location = require('./Location');
        const allDbLocations = await Location.getAll();
        const locationNameMap = {};
        allDbLocations.forEach(loc => locationNameMap[loc.id] = loc.name);

        const locationsByProduct = {};
        locationsData.forEach(loc => {
            if (!locationsByProduct[loc.productId]) {
                locationsByProduct[loc.productId] = {};
                 allDbLocations.forEach(dbLoc => {
                     locationsByProduct[loc.productId][dbLoc.id] = { quantity: 0, locationName: dbLoc.name };
                 });
            }
             if (locationsByProduct[loc.productId][loc.locationId]) {
                locationsByProduct[loc.productId][loc.locationId] = {
                    quantity: loc.quantity,
                    locationName: loc.locationName
                };
             } else {
                 console.warn(`Product ${loc.productId} has data for unknown location ${loc.locationId}`);
             }
        });

        const results = products.map(product => {
            const productLocations = locationsByProduct[product.id] ||
                allDbLocations.reduce((acc, cur) => {
                    acc[cur.id] = { quantity: 0, locationName: cur.name };
                    return acc;
                 }, {});

            let totalQuantity = 0;
            Object.values(productLocations).forEach(loc => {
                totalQuantity += loc.quantity;
            });

            // Return all product details including new fields
            return {
                ...product, // Includes id, name, baseName, variant, etc.
                totalQuantity: totalQuantity,
                locations: productLocations
            };
        });

        return results;
    },


    /**
    * Updates quantities for specified products AT A SPECIFIC LOCATION.
    * (No sorting changes needed here)
    */
    updateProductLocationQuantity: async (updates, userId, locationId) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            for (const { productId, delta } of updates) {
                if (delta === 0) continue;
                const checkSql = 'SELECT quantity FROM product_locations WHERE productId = ? AND locationId = ? FOR UPDATE';
                const [currentRows] = await connection.execute(checkSql, [productId, locationId]);
                let currentQuantity = 0;
                let recordExists = false;
                if (currentRows.length > 0) {
                    currentQuantity = currentRows[0].quantity;
                    recordExists = true;
                }
                // Optional negative stock check can go here
                let finalQuantity = currentQuantity + delta;
                let updateSql;
                let params;
                if (recordExists) {
                    updateSql = `UPDATE product_locations SET quantity = ? WHERE productId = ? AND locationId = ?`;
                    params = [finalQuantity, productId, locationId];
                } else {
                    if (delta > 0) {
                        updateSql = `INSERT INTO product_locations (productId, locationId, quantity) VALUES (?, ?, ?)`;
                        params = [productId, locationId, delta];
                    } else {
                        console.warn(`Skipping negative update for non-existent product ${productId} at location ${locationId}`);
                        continue;
                    }
                }
                await connection.execute(updateSql, params);
                await InventoryLog.insertLog(userId, productId, delta, locationId, 'ADJUSTMENT', connection);
            }
            await connection.commit();
        } catch (err) {
            await connection.rollback();
            console.error("Error updating product location quantities:", err);
            throw err;
        } finally {
            if (connection) connection.release();
        }
    },


    /**
     * Transfers a specified quantity of a product from one location to another.
     * (No sorting changes needed here)
     */
    transferQuantity: async (productId, quantity, fromLocationId, toLocationId, userId) => {
        if (quantity <= 0) throw new Error("Transfer quantity must be positive.");
        if (fromLocationId === toLocationId) throw new Error("Source and destination locations cannot be the same.");
        const qty = parseInt(quantity, 10);
        const pId = parseInt(productId, 10);
        const fromId = parseInt(fromLocationId, 10);
        const toId = parseInt(toLocationId, 10);
         if (isNaN(qty) || isNaN(pId) || isNaN(fromId) || isNaN(toId)) throw new Error("Invalid ID or quantity provided for transfer.");

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const [sourceRows] = await connection.execute('SELECT quantity FROM product_locations WHERE productId = ? AND locationId = ? FOR UPDATE', [pId, fromId]);
            const sourceQuantity = sourceRows.length > 0 ? sourceRows[0].quantity : 0;
            if (sourceQuantity < qty) {
                const productInfo = await this.getProductById(pId);
                const productName = productInfo ? productInfo.name : `ID ${pId}`;
                const Location = require('./Location');
                const fromLocInfo = await Location.findById(fromId);
                const fromLocName = fromLocInfo ? fromLocInfo.name : `ID ${fromId}`;
                throw new Error(`Insufficient stock for ${productName} at ${fromLocName} (Available: ${sourceQuantity}, Required: ${qty})`);
            }
            await connection.execute('UPDATE product_locations SET quantity = quantity - ? WHERE productId = ? AND locationId = ?', [qty, pId, fromId]);
            const [destRows] = await connection.execute('SELECT quantity FROM product_locations WHERE productId = ? AND locationId = ? FOR UPDATE', [pId, toId]);
            if (destRows.length > 0) {
                await connection.execute('UPDATE product_locations SET quantity = quantity + ? WHERE productId = ? AND locationId = ?', [qty, pId, toId]);
            } else {
                await connection.execute('INSERT INTO product_locations (productId, locationId, quantity) VALUES (?, ?, ?)', [pId, toId, qty]);
            }
            await InventoryLog.insertLog(userId, pId, -qty, fromId, 'TRANSFER', connection);
            await InventoryLog.insertLog(userId, pId, qty, toId, 'TRANSFER', connection);
            await connection.commit();
        } catch (err) {
            await connection.rollback();
            console.error("Error during product transfer:", err);
            throw new Error(`Transfer failed: ${err.message || 'An unknown error occurred.'}`);
        } finally {
            if (connection) connection.release();
        }
    },

    // Keep getProductById - select new columns too
    getProductById: async (id) => {
        const sql = 'SELECT id, name, baseName, variant, numericValue, unit FROM products WHERE id = ?';
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    }
};