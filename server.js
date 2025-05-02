// server.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');

// Require Routes
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
// --- NEW: Require Transfer Routes ---
const transferRoutes = require('./routes/transferRoutes');

// Require Middleware
const loadLocationData = require('./middleware/locationMiddleware');

const app = express();

app.set('trust proxy', 1);

// Set up EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Standard Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration (ensure this is BEFORE location middleware)
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'a_stronger_secret_phrase_should_go_here_for_real', // Use a strong secret from .env
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            httpOnly: true, // Helps prevent XSS access to session cookie
            // maxAge: 24 * 60 * 60 * 1000 // Example: 1 day session lifetime
        }
        // Consider using a persistent session store for production later (e.g., connect-redis, connect-mongo)
    })
);

// Flash middleware (after session)
app.use(flash());

// Use Location Middleware (after session, before routes needing location)
// This makes location data available to subsequent routes/views via res.locals
app.use(loadLocationData);


// Redirect root URL ("/") based on login status
app.get('/', (req, res) => {
    // If logged in, go to inventory, otherwise login
    if (req.session.userId) {
        res.redirect('/inventory');
    } else {
        res.redirect('/login');
    }
});

// Define Routes (AFTER middleware)
app.use('/', authRoutes); // Handles /login, /signup, /logout
app.use('/inventory', inventoryRoutes); // Handles /inventory adjustments
app.use('/admin', adminRoutes); // Handles /admin panel and logs
app.use('/user', userRoutes); // Handles /user/settings, /user/set-location
// --- NEW: Use Transfer Routes ---
app.use('/transfer', transferRoutes); // Handles /transfer page and actions


// Basic Error Handling Middleware (Place AFTER all routes)
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack || err); // Log the full error stack
    // Avoid sending stack trace to client in production
    const message = process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message;
    res.status(err.status || 500).render('error', { // Assuming you have an error.ejs view
        message: message,
        error: process.env.NODE_ENV === 'production' ? {} : err // Only show details in dev
    });
     // Or a simpler response:
     // res.status(500).send('Something broke!');
});

// Optional: 404 Handler (Place AFTER all routes and error handler)
app.use((req, res, next) => {
     res.status(404).render('404', { url: req.originalUrl }); // Assuming a 404.ejs view
     // Or simpler: res.status(404).send("Sorry, can't find that!");
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
