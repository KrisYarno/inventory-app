// models/InventoryLog.js
const db = require('../config/db');

module.exports = {
  /**
   * Insert a log row whenever a product quantity changes.
   * Now includes locationId and logType.
   * @param {number} userId - ID of the user making the change
   * @param {number} productId - ID of the product being changed
   * @param {number} delta - The quantity change (+/-)
   * @param {number|null} locationId - ID of the location affected (can be null for old logs)
   * @param {'ADJUSTMENT'|'TRANSFER'} logType - Type of log entry
   * @param {object|null} connection - Optional DB connection for transactions
   */
  async insertLog(userId, productId, delta, locationId, logType = 'ADJUSTMENT', connection = null) {
    // Use the connection if provided (for transactions), otherwise use the pool
    const executor = connection || db;
    const sql = `
      INSERT INTO inventory_logs (userId, productId, delta, locationId, logType, changeTime)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    const params = [userId, productId, delta, locationId, logType];

    await executor.execute(sql, params);
  },

  /**
   * Get all logs, joined to user, product, and location name for easy display.
   */
  async getAllLogs() {
    const sql = `
      SELECT
        l.id,
        l.changeTime,
        l.delta,
        l.logType,
        u.username AS changedBy,
        p.name AS productName,
        loc.name AS locationName -- Join to get location name
      FROM inventory_logs l
      JOIN users u ON l.userId = u.id
      JOIN products p ON l.productId = p.id
      LEFT JOIN locations loc ON l.locationId = loc.id -- Left join in case locationId is NULL for old logs
      ORDER BY l.changeTime DESC
    `;
    const [rows] = await db.execute(sql);
    return rows;
  }
};
