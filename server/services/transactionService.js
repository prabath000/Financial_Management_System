const { db } = require('../database');

const TransactionService = {
    async findAll(query = {}) {
        let sql = 'SELECT t.*, c.name as customerName FROM transactions t LEFT JOIN customers c ON t.customerId = c.id';
        const params = [];

        if (query.customer) {
            sql += ' WHERE t.customerId = ?';
            params.push(query.customer);
        }

        sql += ' ORDER BY t.date DESC';
        const rows = db.prepare(sql).all(...params);
        return rows.map(row => ({
            ...row,
            _id: row.id,
            customer: row.customerId ? { _id: row.customerId, name: row.customerName } : null
        }));
    },

    async findById(id) {
        const row = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
        if (!row) return null;
        return { ...row, _id: row.id };
    },

    async create(data) {
        const { amount, type, customer, chequeNumber, chequeDate, description, date, status } = data;
        const info = db.prepare(`
            INSERT INTO transactions (amount, type, customerId, chequeNumber, chequeDate, description, date, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            amount,
            type,
            customer || null,
            chequeNumber || null,
            chequeDate || null,
            description || null,
            date || new Date().toISOString(),
            status || 'Confirmed'
        );
        return this.findById(info.lastInsertRowid);
    },

    async update(id, data) {
        const payload = { ...data };
        if (payload.customer) {
            payload.customerId = payload.customer;
            delete payload.customer;
        }

        const allowedFields = ['amount', 'type', 'customerId', 'chequeNumber', 'chequeDate', 'description', 'date', 'status'];
        const fieldsToUpdate = Object.keys(payload).filter(f => allowedFields.includes(f));

        if (fieldsToUpdate.length === 0) return this.findById(id);

        const setClause = fieldsToUpdate.map(f => `${f} = ?`).join(', ');
        const values = fieldsToUpdate.map(f => payload[f]);

        db.prepare(`UPDATE transactions SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`)
            .run(...values, id);
        return this.findById(id);
    },

    async delete(id) {
        const transaction = this.findById(id);
        db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
        return transaction;
    },

    async deleteMany(query) {
        // Simple delete all for now as used in routes
        return db.prepare('DELETE FROM transactions').run();
    },

    async getAnalytics() {
        const sql = `
            SELECT 
                strftime('%m', date) as month,
                SUM(amount) as totalIncome,
                SUM(CASE WHEN type = 'Cash' THEN amount ELSE 0 END) as cashTotal,
                SUM(CASE WHEN type = 'Credit' THEN amount ELSE 0 END) as creditTotal,
                SUM(CASE WHEN type = 'Cheque' THEN amount ELSE 0 END) as chequeTotal
            FROM transactions 
            WHERE status = 'Confirmed'
            GROUP BY month
            ORDER BY month ASC
        `;
        const results = db.prepare(sql).all();
        return results.map(r => ({
            _id: parseInt(r.month),
            totalIncome: r.totalIncome,
            cashTotal: r.cashTotal,
            creditTotal: r.creditTotal,
            chequeTotal: r.chequeTotal
        }));
    }
};

module.exports = TransactionService;
