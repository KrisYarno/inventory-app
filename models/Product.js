// models/Product.js
const db = require('../config/db');
const InventoryLog = require('./InventoryLog'); // Import the log model

module.exports = {
  getAllProducts: async () => {
    const sql = 'SELECT * FROM products';
    const [rows] = await db.execute(sql);
    return rows;
  },

  updateProductQuantities: async (updates, userId) => {
    // updates is an array of { productId, delta }
    // userId is who triggered these changes
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      for (const { productId, delta } of updates) {
        // Skip if no change:
        if (delta === 0) continue;

        // 1) Update product quantity
        const updateSql = `
          UPDATE products
          SET quantity = quantity + ?
          WHERE id = ?
        `;
        await connection.execute(updateSql, [delta, productId]);

        // 2) Insert a change-log record in the same transaction
        await InventoryLog.insertLog(userId, productId, delta, connection);
      }

      await connection.commit();
      connection.release();
    } catch (err) {
      await connection.rollback();
      connection.release();
      throw err;
    }
  },

  getProductById: async (id) => {
    const sql = 'SELECT * FROM products WHERE id = ?';
    const [rows] = await db.execute(sql, [id]);
    return rows[0];
  }
};
