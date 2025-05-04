# Inventory Management App

A full-stack web application designed for small business inventory tracking, built with Node.js, Express, EJS, and MySQL. This application allows multiple users to manage inventory adjustments across different physical locations, includes an admin approval workflow for new users, and provides administrative oversight features.

## Features

* **User Authentication & Authorization:**
    * User signup with email, username, and password.
    * **Admin Approval Required:** New users cannot log in until explicitly approved by an administrator via the admin panel.
    * Secure login using hashed passwords (`bcrypt`).
    * Session management using `express-session`.
    * **Remember Me:** Option to stay logged in for one week across browser sessions.
    * Role-based access control (Admin vs. Regular User).
* **Inventory Management:**
    * **Location-Based Tracking ("Buckets"):** Inventory quantities are tracked per product *and* per defined location (e.g., Office, Derek's, House).
    * **Location Selection:** Users select their current operating location via a navbar dropdown. This location persists for the current session.
    * **Inventory Adjustment:** Users can increment or decrement product quantities. Adjustments apply *only* to the user's currently selected location bucket. Includes +/- buttons and direct number input.
    * **Confirmation Step:** Users are shown a summary of non-zero adjustments and the target location before changes are saved.
    * **Inventory Transfer:** A dedicated page allows users to move specific quantities of a product from one location bucket to another, ensuring the total product quantity remains unchanged.
* **Product Information:**
    * Database schema supports separating `baseName`, `variant`, and `numericValue` for improved sorting (alphabetical by name, then numerical by variant value).
    * *(Note: Manual data population required for existing products after schema change).*
* **Administration Panel (Admin Role Required):**
    * **Inventory Overview:** Displays a table of all products with their *total* quantity across all locations.
    * **Location Breakdown:** Clickable product rows expand to show the quantity breakdown for each defined location.
    * **CSV Export:** Export the current inventory overview (Product ID, Name, Total Quantity) as a CSV file.
    * **User Management:**
        * View all registered users.
        * Approve or Revoke approval for pending/active users.
        * Grant or Revoke administrator privileges.
        * Delete users (with confirmation prompt).
    * **Inventory Change Log Viewer:** View a timestamped log of all inventory adjustments and transfers, including which user made the change, the product, the quantity delta, the location affected, and the type of change.
    * **Legacy User Creation:** Admins can manually create basic user accounts (username/password, approved by default, no email).
* **Account Settings:**
    * Users can change their own password after verifying their old one.
    * Users can set their **default** login location (the location selected automatically when they start a new session).

## Tech Stack

* **Backend:** Node.js, Express.js
* **Frontend:** EJS (Embedded JavaScript Templates) for server-side rendering, Bootstrap 5 for styling and UI components, Vanilla JavaScript for client-side interactions.
* **Database:** MySQL (typically hosted separately, e.g., on Railway)
* **Authentication:** `express-session` for session management, `bcrypt` for password hashing.
* **Other Libraries:** `dotenv` for environment variables, `mysql2` for database connection, `connect-flash` for status messages, `csv-writer` for CSV export.

## Getting Started

### Prerequisites

* Node.js (v14 or later recommended)
* npm (comes with Node.js)
* Access to a MySQL database instance

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/KrisYarno/inventory-app.git](https://github.com/KrisYarno/inventory-app.git)
    cd inventory-app
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up Environment Variables:**
    Create a `.env` file in the project root directory. Add the following variables, replacing the placeholder values with your actual database credentials and a strong session secret:

    ```dotenv
    # Database Configuration (Example for Railway, adjust as needed)
    DB_HOST=your_database_host
    DB_PORT=your_database_port
    DB_USER=your_database_user
    DB_PASSWORD=your_database_password
    DB_NAME=your_database_name

    # Session Configuration
    SESSION_SECRET=replace_with_a_very_long_random_strong_secret_key

    # Server Configuration (Optional)
    PORT=3000
    NODE_ENV=development # Set to 'production' in your deployment environment
    ```

4.  **Database Initialization:**
    * Connect to your MySQL database using a tool like MySQL Workbench, DBeaver, or the command line.
    * Execute the necessary SQL commands to create the tables (`users`, `products`, `locations`, `product_locations`, `inventory_logs`) and add the required columns and constraints. Refer to the SQL statements provided during development steps or potentially create an initialization script (`schema.sql`).
    * **Crucially:** After creating the schema, manually populate the `locations` table (IDs 1, 2, 3, 4 with names) and migrate product data (populate `baseName`, `variant`, `numericValue` in the `products` table and run the initial `INSERT INTO product_locations ... SELECT FROM products` statement).

5.  **Run the application:**
    ```bash
    npm start
    ```
    The application should be running on `http://localhost:3000` (or the port specified in `.env`).

## Database Schema Overview

* **`users`**: Stores user credentials and roles.
    * `id`, `username`, `email`, `passwordHash`, `isAdmin` (BOOLEAN/TINYINT), `isApproved` (BOOLEAN/TINYINT), `defaultLocationId` (FK to `locations.id`)
* **`products`**: Stores core product information.
    * `id`, `name` (Original full name, used for display), `baseName`, `variant`, `unit`, `numericValue` (for sorting)
* **`locations`**: Defines the physical inventory locations.
    * `id` (INT, PK - e.g., 1, 2, 3, 4), `name` (VARCHAR - e.g., 'Office', 'Derek\'s', 'House', 'Warehouse')
* **`product_locations`**: Tracks quantity of each product at each location.
    * `id`, `productId` (FK to `products.id`, ON DELETE CASCADE), `locationId` (FK to `locations.id`), `quantity` (INT)
* **`inventory_logs`**: Records all changes to inventory.
    * `id`, `userId` (FK to `users.id`), `productId` (FK to `products.id`, ON DELETE SET NULL), `delta` (INT), `locationId` (FK to `locations.id`), `logType` (ENUM('ADJUSTMENT', 'TRANSFER')), `changeTime` (TIMESTAMP)

## Application Workflow & Logic

* **Authentication:** Users sign up -> Admin approves -> User logs in. Session cookie is created. If "Remember Me" is checked, cookie `maxAge` is set for 1 week.
* **Location Context:** Upon login, `req.session.currentLocationId` is set to the user's `defaultLocationId`. Users can temporarily change `req.session.currentLocationId` using the navbar dropdown for their current session only. The default location can be changed persistently on the Account Settings page.
* **Inventory Adjustment:** On the main inventory page, adjustments entered (`delta`) are applied to the `product_locations` table specifically for the `productId` and the user's current `req.session.currentLocationId`. An 'ADJUSTMENT' log entry is created.
* **Inventory Transfer:** The transfer page allows moving `quantity` from a `fromLocationId` to a `toLocationId` for a specific `productId`. The database transaction ensures the total quantity remains constant by decrementing the source and incrementing the destination in `product_locations`. Two 'TRANSFER' log entries are created (one negative, one positive).
* **Admin View:** The overview fetches products and calculates `totalQuantity` by summing quantities across all locations from `product_locations` for display. Location breakdowns are fetched dynamically.

## Design Decisions / Rationale

* **Admin Approval:** Implemented via the `isApproved` flag on the `users` table to ensure only authorized personnel can access the inventory system.
* **Location "Buckets":** The `product_locations` table provides a normalized way to track stock per location, avoiding redundancy in the main `products` table. Total quantity is calculated dynamically when needed (e.g., Admin Overview).
* **Transactional Integrity:** Inventory adjustments and transfers are performed within database transactions to ensure that both the quantity update (`product_locations`) and the corresponding log entry (`inventory_logs`) succeed or fail together.
* **UI Framework:** Bootstrap 5 was chosen for rapid development of a responsive, mobile-friendly UI with consistent components.
* **Product Sorting:** Added `baseName` and `numericValue` to allow for more logical sorting (alphabetical then numerical) than relying on the combined `name` field. Manual data migration was chosen by the user for flexibility.
* **Session Location vs. Default Location:** The distinction allows users to set a permanent default starting location but override it temporarily for specific tasks during a session without changing their default.
* **Remember Me:** Uses `express-session`'s `cookie.maxAge` property, set conditionally during login, rather than separate token-based persistence.
* **Foreign Key Constraints:** `ON DELETE CASCADE` is used for `product_locations` as location quantities are meaningless without the product. `ON DELETE SET NULL` is used for `inventory_logs` to preserve historical logs even if the associated product is deleted.

## Deployment

* The application is designed to be deployed on Platform-as-a-Service providers like Render.
* The MySQL database is hosted separately (e.g., on Railway).
* Ensure all necessary environment variables (Database credentials, `SESSION_SECRET`, `NODE_ENV=production`) are set in the deployment environment.
* The `trust proxy` setting (`app.set('trust proxy', 1);`) is enabled in `server.js`, which is typically required when running behind reverse proxies (common on PaaS).

## Known Issues / Future Enhancements

* **Session Store:** Currently uses the default `MemoryStore` for `express-session`, which is not suitable for production (loses sessions on server restart, doesn't scale). Recommend configuring a persistent store like `connect-redis` or `connect-mysql2` for production deployments.
* **Product Management UI:** Currently no UI for Admins to Add, Edit, or Delete products directly within the app. This requires corresponding backend routes, controller actions, and potentially model functions. Deletion requires careful consideration of related data (use `ON DELETE SET NULL`/`CASCADE`).
* **Automated Log Management:** The request for automatic weekly export/backup/clearing of `inventory_logs` (e.g., to Google Drive) is not yet implemented. This would likely require a scheduled task runner (e.g., `node-cron`) and potentially integration with external APIs.
* **Low Quantity Notifications:** No system currently exists to alert users/admins about products running low on stock.
* **Enhanced Account Management:** Further self-service options (e.g., email change) or admin controls could be added.
* **Error Handling:** Basic error handling exists, but could be improved (e.g., more specific error pages, more robust logging).
* **Input Validation:** Server-side validation could be more comprehensive.
* **Testing:** No automated tests are currently included.

---