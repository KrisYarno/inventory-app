// models/Location.js
const db = require('../config/db');

module.exports = {
  /**
   * Fetches all locations from the database.
   * @returns {Promise<Array<{id: number, name: string}>>}
   */
  getAll: async () => {
    const sql = 'SELECT id, name FROM locations ORDER BY id';
    const [rows] = await db.execute(sql);
    return rows;
  },

  /**
  * Fetches a single location by its ID.
  * @param {number} id
  * @returns {Promise<{id: number, name: string}|null>}
  */
  findById: async (id) => {
    const sql = 'SELECT id, name FROM locations WHERE id = ?';
    const [rows] = await db.execute(sql, [id]);
    return rows[0] || null; // Return the first row or null if not found
  }
};