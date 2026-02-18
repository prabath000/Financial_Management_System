const { db } = require('../database');

const ProductService = {
    getAll() {
        return db.prepare('SELECT * FROM products ORDER BY name').all();
    },

    getById(id) {
        return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    },

    create(data) {
        const { name, category, quantity, price, alertLevel } = data;
        const info = db.prepare(`
            INSERT INTO products (name, category, quantity, price, alertLevel)
            VALUES (?, ?, ?, ?, ?)
        `).run(name, category, quantity || 0, price || 0, alertLevel || 10);

        return { id: info.lastInsertRowid, ...data };
    },

    update(id, data) {
        const fields = Object.keys(data);
        if (fields.length === 0) return this.getById(id);

        const setClause = fields.map(f => `${f} = ?`).join(', ');
        const values = Object.values(data);

        db.prepare(`UPDATE products SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`)
            .run(...values, id);

        return this.getById(id);
    },

    delete(id) {
        const product = this.getById(id);
        if (product) {
            db.prepare('DELETE FROM products WHERE id = ?').run(id);
        }
        return product;
    }
};

module.exports = ProductService;
