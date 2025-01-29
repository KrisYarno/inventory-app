// models/User.js
const db = require('../config/db.js');

// This is a simple model helper to handle user data.
module.exports = {
  createUser: async (username, passwordHash, isAdmin = 0) => {
    const sql = 'INSERT INTO users (username, passwordHash, isAdmin) VALUES (?, ?, ?)';
    const [result] = await db.execute(sql, [username, passwordHash, isAdmin]);
    return result.insertId; // returns the new user ID
  },

  findByUsername: async (username) => {
    const sql = 'SELECT * FROM users WHERE username = ?';
    const [rows] = await db.execute(sql, [username]);
    return rows[0];
  },

  findById: async (id) => {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const [rows] = await db.execute(sql, [id]);
    return rows[0];
  },

  getAllUsers: async () => {
    const sql = 'SELECT id, username, isAdmin FROM users';
    const [rows] = await db.execute(sql);
    return rows;
  }
};
