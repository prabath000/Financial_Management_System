const fs = require('fs');
const path = require('path');

// Ultra-robust logging for production debugging
const logFile = process.env.DATABASE_PATH ? path.join(path.dirname(process.env.DATABASE_PATH), 'backend-debug.log') : null;
const log = (msg) => {
    const entry = `${new Date().toISOString()} - ${msg}\n`;
    if (logFile) fs.appendFileSync(logFile, entry);
    console.log(msg);
};

log('Backend process started');

try {
    const express = require('express');
    const cors = require('cors');
    const dotenv = require('dotenv');
    const { initializeDb } = require('./database');

    dotenv.config({ path: path.join(__dirname, '.env') });

    if (!process.env.JWT_SECRET) {
        log('WARNING: JWT_SECRET is not defined in environment variables. Using fallback for development.');
        process.env.JWT_SECRET = 'uswaththa-fallback-secret-2026';
    }

    const app = express();
    const PORT = process.env.PORT || 5000;

    // Initialize SQLite
    log('Initializing SQLite...');
    initializeDb();

    // Auto-create admin user if not exists
    const UserService = require('./services/userService');
    const existingUsers = UserService.findOne({ username: 'admin' }).then(user => {
        if (!user) {
            log('No admin user found, creating default admin...');
            UserService.register({ username: 'admin', password: 'password123' })
                .then(() => log('Default admin user created: admin / password123'))
                .catch(err => log(`Failed to create default admin: ${err.message}`));
        } else {
            log('Admin user already exists.');
        }
    }).catch(err => log(`Error checking for admin user: ${err.message}`));

    log('SQLite Initialized.');

    // Middleware
    app.use(cors());
    app.use(express.json());

    // Routes
    const authRoutes = require('./routes/auth');
    const customerRoutes = require('./routes/customers');
    const transactionRoutes = require('./routes/transactions');

    app.use('/api/auth', authRoutes);
    app.use('/api/customers', customerRoutes);
    app.use('/api/transactions', transactionRoutes);
    app.use('/api/products', require('./routes/products'));
    app.use('/api/daily-records', require('./routes/dailyRecords'));
    app.use('/api/analytics', require('./routes/analytics'));

    // Global error handler for debugging
    app.use((err, req, res, next) => {
        log(`Unhandled API Error: ${err.message}`);
        res.status(500).send({ error: 'Internal Server Error', details: err.message });
    });

    app.get('/', (req, res) => {
        res.send('Financial Management System API (SQLite Running)');
    });

    // Port listener - Default binding for Electron utilityProcess compatibility
    const server = app.listen(PORT, () => {
        const address = server.address();
        log(`Server running on port ${PORT}`);
        log(`Server address: ${JSON.stringify(address)}`);
    });

    server.on('error', (err) => {
        log(`Server error: ${err.message}`);
        if (err.code === 'EADDRINUSE') {
            log(`Port ${PORT} is already in use`);
        }
    });

} catch (err) {
    log(`CRITICAL BACKEND ERROR: ${err.message}`);
    log(err.stack);
    process.exit(1);
}
