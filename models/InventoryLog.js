// models/InventoryLog.js
const db = require('../config/db.js');

module.exports = {
  async insertLog(userId, productId, delta) {
    const sql = `
      INSERT INTO inventory_logs (userId, productId, delta, changeTime)
      VALUES (?, ?, ?, NOW())
    `;
    await db.execute(sql, [userId, productId, delta]);
  },

  async getAllLogs() {
    // We'll join with users and products to get more descriptive info
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
