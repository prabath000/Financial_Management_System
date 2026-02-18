const path = require('path');
const os = require('os');
const bcrypt = require('bcryptjs');
// Use server's better-sqlite3 which is already rebuilt for Electron
const Database = require('./server/node_modules/better-sqlite3');

// Path to Electron app's database
const appDataPath = path.join(os.homedir(), 'AppData', 'Roaming', 'financial-management-system', 'data.db');
console.log(`Seeding database at: ${appDataPath}`);

const db = new Database(appDataPath);

async function seed() {
    try {
        // Check if admin user already exists
        const existing = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');

        if (existing) {
            console.log('✅ Admin user already exists');
            console.log('   Username: admin');
            console.log('   (Password unchanged)');
        } else {
            // Create admin user
            const hashedPassword = await bcrypt.hash('password123', 10);
            db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('admin', hashedPassword, 'admin');

            console.log('✅ Admin user created successfully!');
            console.log('   Username: admin');
            console.log('   Password: password123');
            console.log('\n🔐 Please change this password after first login!');
        }

        db.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding database:', err.message);
        process.exit(1);
    }
}

seed();
