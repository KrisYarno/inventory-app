// models/User.js
const db = require('../config/db.js');

module.exports = {
  /**
   * Create a user (old version: no email).
   * You mentioned you want to keep it, even if somewhat redundant.
   */
  createUser: async (username, passwordHash, isAdmin = 0) => {
    const sql = `
      INSERT INTO users (username, passwordHash, isAdmin)
      VALUES (?, ?, ?)
    `;
    const [result] = await db.execute(sql, [username, passwordHash, isAdmin]);
    return result.insertId;
  },

  /**
   * Create user with email + isApproved (for signup).
   */
  createUserWithEmail: async ({
    username,
    email,
    passwordHash,
    isAdmin = 0,
    isApproved = 0
  }) => {
    const sql = `
      INSERT INTO users (username, email, passwordHash, isAdmin, isApproved)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [
      username,
      email,
      passwordHash,
      isAdmin,
      isApproved
    ]);
    return result.insertId;
  },

  /**
   * Find by username
   */
  findByUsername: async (username) => {
    const sql = 'SELECT * FROM users WHERE username = ?';
    const [rows] = await db.execute(sql, [username]);
    return rows[0];
  },

  /**
   * Find by email
   */
  findByEmail: async (email) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await db.execute(sql, [email]);
    return rows[0];
  },

  /**
   * Find by ID
   */
  findById: async (id) => {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const [rows] = await db.execute(sql, [id]);
    return rows[0];
  },

  /**
   * Get all users (for admin)
   */
  getAllUsers: async () => {
    const sql = 'SELECT * FROM users';
    const [rows] = await db.execute(sql);
    return rows;
  },

  /**
   * Approve user (set isApproved=1)
   */
  approveUserById: async (userId) => {
    const sql = 'UPDATE users SET isApproved = 1 WHERE id = ?';
    await db.execute(sql, [userId]);
  },

  /**
   * Revoke approval if needed
   */
  revokeApprovalById: async (userId) => {
    const sql = 'UPDATE users SET isApproved = 0 WHERE id = ?';
    await db.execute(sql, [userId]);
  },

  /**
   * Grant admin
   */
  grantAdmin: async (userId) => {
    const sql = 'UPDATE users SET isAdmin = 1 WHERE id = ?';
    await db.execute(sql, [userId]);
  },

  /**
   * Revoke admin
   */
  revokeAdmin: async (userId) => {
    const sql = 'UPDATE users SET isAdmin = 0 WHERE id = ?';
    await db.execute(sql, [userId]);
  },

  /**
   * Update password
   */
  updatePassword: async (id, newHash) => {
    const sql = 'UPDATE users SET passwordHash = ? WHERE id = ?';
    await db.execute(sql, [newHash, id]);
  },

  /**
   * Delete user
   */
  deleteUser: async (userId) => {
    const sql = 'DELETE FROM users WHERE id = ?';
    await db.execute(sql, [userId]);
  },
};
