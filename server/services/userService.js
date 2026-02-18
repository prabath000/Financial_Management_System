const { db } = require('../database');
const bcrypt = require('bcryptjs');

const UserService = {
    async findOne({ username }) {
        const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        if (!row) return null;

        // Add helper for password comparison to mimic Mongoose model method
        return {
            ...row,
            _id: row.id, // Compatibility with frontend expecting _id
            async comparePassword(candidatePassword) {
                return await bcrypt.compare(candidatePassword, row.password);
            }
        };
    },

    async register({ username, password }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const info = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hashedPassword);
        return { id: info.lastInsertRowid, username };
    },

    async findById(id) {
        const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        if (!row) return null;
        return { ...row, _id: row.id };
    }
};

module.exports = UserService;
