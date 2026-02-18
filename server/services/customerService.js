const { db } = require('../database');

const CustomerService = {
    async findAll() {
        const rows = db.prepare('SELECT * FROM customers').all();
        return rows.map(row => ({ ...row, _id: row.id }));
    },

    async findById(id) {
        const row = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
        if (!row) return null;
        return { ...row, _id: row.id };
    },

    async create(data) {
        const { name, phone, address, creditBalance, pendingBalance } = data;
        const info = db.prepare(`
            INSERT INTO customers (name, phone, address, creditBalance, pendingBalance)
            VALUES (?, ?, ?, ?, ?)
        `).run(name, phone || null, address || null, creditBalance || 0, pendingBalance || 0);
        return { ...data, id: info.lastInsertRowid, _id: info.lastInsertRowid };
    },

    async update(id, data) {
        const fields = Object.keys(data);
        const setClause = fields.map(f => `${f} = ?`).join(', ');
        const values = Object.values(data);
        db.prepare(`UPDATE customers SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`)
            .run(...values, id);
        return this.findById(id);
    },

    async delete(id) {
        const customer = this.findById(id);
        db.prepare('DELETE FROM customers WHERE id = ?').run(id);
        return customer;
    },

    async deleteAll() {
        return db.prepare('DELETE FROM customers').run();
    }
};

module.exports = CustomerService;
