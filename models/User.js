// models/User.js
const db = require('../config/db.js');

module.exports = {
    /**
     * Create a user (old version: no email).
     * Adds user as approved and assigns default location.
     */
    createUser: async (username, passwordHash, isAdmin = 0, defaultLocationId = 1) => {
        const sql = `
      INSERT INTO users (username, passwordHash, isAdmin, isApproved, defaultLocationId)
      VALUES (?, ?, ?, 1, ?) <%# Legacy creates approved users, default location added %>
    `;
        // Note: Added isApproved = 1 for legacy, and defaultLocationId
        const [result] = await db.execute(sql, [username, passwordHash, isAdmin, defaultLocationId]);
        return result.insertId;
    },

    /**
     * Create user with email + isApproved (for signup).
     * Assigns default location.
     */
    createUserWithEmail: async ({
        username,
        email,
        passwordHash,
        isAdmin = 0,
        isApproved = 0,
        defaultLocationId = 1 // Default to location 1 ('Office')
    }) => {
        const sql = `
      INSERT INTO users (username, email, passwordHash, isAdmin, isApproved, defaultLocationId)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
        const [result] = await db.execute(sql, [
            username,
            email,
            passwordHash,
            isAdmin,
            isApproved,
            defaultLocationId // Add location ID here
        ]);
        return result.insertId;
    },

    /**
     * Find by username
     */
    findByUsername: async (username) => {
        // Select specific columns including defaultLocationId
        const sql = 'SELECT id, username, email, passwordHash, isAdmin, isApproved, defaultLocationId FROM users WHERE username = ?';
        const [rows] = await db.execute(sql, [username]);
        return rows[0];
    },

    /**
     * Find by email
     */
    findByEmail: async (email) => {
        // Select specific columns including defaultLocationId
        const sql = 'SELECT id, username, email, passwordHash, isAdmin, isApproved, defaultLocationId FROM users WHERE email = ?';
        const [rows] = await db.execute(sql, [email]);
        return rows[0];
    },

    /**
     * Find by ID
     */
    findById: async (id) => {
        // Select specific columns including defaultLocationId
        const sql = 'SELECT id, username, email, passwordHash, isAdmin, isApproved, defaultLocationId FROM users WHERE id = ?';
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    },

    /**
     * Get all users (for admin)
     */
    getAllUsers: async () => {
        // Select specific columns including defaultLocationId
        const sql = 'SELECT id, username, email, isAdmin, isApproved, defaultLocationId FROM users ORDER BY username'; // Excluded passwordHash for security/efficiency
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
        // Consider what should happen to logs associated with this user?
        // Maybe set userId to NULL in logs? Or prevent deletion if logs exist?
        // For now, just deleting the user.
        const sql = 'DELETE FROM users WHERE id = ?';
        await db.execute(sql, [userId]);
    },

    /** NEW FUNCTION **/
    /**
     * Updates the default location for a given user.
     * @param {number} userId - The ID of the user to update.
     * @param {number} newLocationId - The ID of the new default location.
     */
    updateDefaultLocation: async (userId, newLocationId) => {
        // Add validation here? Ensure newLocationId is valid?
        // For now, assuming controller validated it exists.
        const sql = 'UPDATE users SET defaultLocationId = ? WHERE id = ?';
        await db.execute(sql, [newLocationId, userId]);
    } // <<< Note: No comma needed here as it's the last method

};