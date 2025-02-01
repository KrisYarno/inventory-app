// models/InventoryLog.js
const db = require('../config/db');

module.exports = {
  /**
   * Insert a log row whenever a product quantity changes.
   */
  async insertLog(userId, productId, delta, connection = null) {
    // If you're inside a transaction, pass 'connection'; otherwise, use db.execute.
    const sql = `
      INSERT INTO inventory_logs (userId, productId, delta, changeTime)
      VALUES (?, ?, ?, NOW())
    `;
    if (connection) {
      await connection.execute(sql, [userId, productId, delta]);
    } else {
      await db.execute(sql, [userId, productId, delta]);
    }
  },

  /**
   * Get all logs, joined to the user and product name for easy display.
   */
  async getAllLogs() {
    const sql = `
      SELECT 
        l.id,
        l.changeTime,
        l.delta,
        u.username AS changedBy,
        p.name AS productName
      FROM inventory_logs l
      JOIN users u ON l.userId = u.id
      JOIN products p ON l.productId = p.id
      ORDER BY l.changeTime DESC
    `;
    const [rows] = await db.execute(sql);
    return rows;
  }
};
