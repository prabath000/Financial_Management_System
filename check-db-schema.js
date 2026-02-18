const { db } = require('./server/database');

try {
    const table = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='products'").get();
    if (table) {
        console.log("Table 'products' exists.");
        const columns = db.prepare("PRAGMA table_info(products)").all();
        console.log("Columns:", columns.map(c => c.name).join(', '));
    } else {
        console.log("Table 'products' does NOT exist.");
    }
} catch (err) {
    console.error("Error checking database:", err);
}
