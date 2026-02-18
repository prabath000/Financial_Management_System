const UserService = require('./services/userService');
const { initializeDb } = require('./database');
const dotenv = require('dotenv');

dotenv.config();
initializeDb();

async function seed() {
    try {
        const existing = await UserService.findOne({ username: 'admin' });
        if (existing) {
            console.log('Admin user already exists');
        } else {
            await UserService.register({ username: 'admin', password: 'password123' });
            console.log('Admin user created (admin / password123)');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error seeding:', err);
        process.exit(1);
    }
}

seed();
