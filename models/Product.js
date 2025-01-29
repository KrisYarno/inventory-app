// models/Product.js
const db = require('../config/db');
// We'll assume you have InventoryLog or the logs table already defined, 
// but if you're inserting logs directly inside this file, that's fine too.

module.exports = {
  getAllProducts: async () => {
    const sql = 'SELECT * FROM products';
    const [rows] = await db.execute(sql);
    return rows;
  },

  // Modified to skip insert/update if delta = 0
  updateProductQuantities: async (updates, userId) => {
    // 'updates' is an array of { productId, delta }
    // 'userId' is who triggered these changes.
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      for (const { productId, delta } of updates) {
        // Skip if there is no change:
        if (delta === 0) {
          continue;
        }

        // 1) Update the product's quantity:
        const updateSql = `
          UPDATE products
          SET quantity = quantity + ?
          WHERE id = ?
        `;
        await connection.execute(updateSql, [delta, productId]);

        // 2) Insert a change-log record inside the same transaction:
        const logSql = `
          INSERT INTO inventory_logs (userId, productId, delta, changeTime)
          VALUES (?, ?, ?, NOW())
        `;
        await connection.execute(logSql, [userId, productId, delta]);
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
