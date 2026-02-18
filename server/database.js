const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Path to SQLite database file - Use environment variable for production writable path
const dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, 'data.db');

// Ensure the directory exists if it's external
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}
const db = new Database(dbPath, { verbose: console.log });

// Initialize database schema
const initializeDb = () => {
    // Enable Foreign Keys
    db.pragma('foreign_keys = ON');

    // Users Table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'admin',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    // Customers Table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT,
            address TEXT,
            creditBalance REAL DEFAULT 0,
            pendingBalance REAL DEFAULT 0,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    // Products Table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT,
            quantity INTEGER DEFAULT 0,
            price REAL DEFAULT 0,
            alertLevel INTEGER DEFAULT 10,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    // Transactions Table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL NOT NULL,
            type TEXT CHECK(type IN ('Cash', 'Credit', 'Cheque')) NOT NULL,
            customerId INTEGER,
            chequeNumber TEXT,
            chequeDate DATETIME,
            description TEXT,
            date DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT CHECK(status IN ('Pending', 'Confirmed')) DEFAULT 'Confirmed',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (customerId) REFERENCES customers (id) ON DELETE SET NULL
        )
    `).run();

    // Daily Records Table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS daily_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT UNIQUE NOT NULL,
            grossSale REAL DEFAULT 0,
            discount REAL DEFAULT 0,
            netReturn REAL DEFAULT 0,
            chequeSale REAL DEFAULT 0,
            creditSale REAL DEFAULT 0,
            cashSale REAL DEFAULT 0,
            deliveryExpense REAL DEFAULT 0,
            fuelExpense REAL DEFAULT 0,
            otherExpense REAL DEFAULT 0,
            note TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    console.log('SQLite Database Initialized');
};

module.exports = {
    db,
    initializeDb
};
