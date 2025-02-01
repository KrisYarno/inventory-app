// server.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const adminRoutes = require('./routes/adminRoutes');
userRoutes = require('./routes/userRoutes');

const app = express();

// Set up EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for parsing form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'defaultsecret',
    resave: false,
    saveUninitialized: false,
    // Example cookie config: 
    // cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
  })
);

// Flash middleware
app.use(flash());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Redirect root URL ("/") to "/inventory"
app.get('/', (req, res) => {
  res.redirect('/inventory');
});

// Routes
app.use('/', authRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
