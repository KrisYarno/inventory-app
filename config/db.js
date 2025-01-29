// config/db.js
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,         // e.g. viaduct.proxy.rlwy.net
  port: process.env.DB_PORT || 3306, // e.g. 55728
  user: process.env.DB_USER,         // e.g. root
  password: process.env.DB_PASSWORD, // your password
  database: process.env.DB_NAME,     // e.g. railway
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
