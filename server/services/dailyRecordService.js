const { db } = require('../database');

const DailyRecordService = {
    async findOne({ date }) {
        const row = db.prepare('SELECT * FROM daily_records WHERE date = ?').get(date);
        if (!row) return null;
        return { ...row, _id: row.id };
    },

    async create(data) {
        const { date, grossSale, discount, netReturn, chequeSale, creditSale, cashSale, expenses, note } = data;
        const info = db.prepare(`
            INSERT INTO daily_records (
                date, grossSale, discount, netReturn, chequeSale, creditSale, cashSale, 
                deliveryExpense, fuelExpense, otherExpense, note
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            date,
            grossSale || 0,
            discount || 0,
            netReturn || 0,
            chequeSale || 0,
            creditSale || 0,
            cashSale || 0,
            expenses?.delivery || 0,
            expenses?.fuel || 0,
            expenses?.other || 0,
            note || null
        );
        return { ...data, id: info.lastInsertRowid, _id: info.lastInsertRowid };
    },

    async update(date, data) {
        const fields = [];
        const values = [];

        if (data.grossSale !== undefined) { fields.push('grossSale = ?'); values.push(data.grossSale); }
        if (data.discount !== undefined) { fields.push('discount = ?'); values.push(data.discount); }
        if (data.netReturn !== undefined) { fields.push('netReturn = ?'); values.push(data.netReturn); }
        if (data.chequeSale !== undefined) { fields.push('chequeSale = ?'); values.push(data.chequeSale); }
        if (data.creditSale !== undefined) { fields.push('creditSale = ?'); values.push(data.creditSale); }
        if (data.cashSale !== undefined) { fields.push('cashSale = ?'); values.push(data.cashSale); }

        if (data.expenses) {
            if (data.expenses.delivery !== undefined) { fields.push('deliveryExpense = ?'); values.push(data.expenses.delivery); }
            if (data.expenses.fuel !== undefined) { fields.push('fuelExpense = ?'); values.push(data.expenses.fuel); }
            if (data.expenses.other !== undefined) { fields.push('otherExpense = ?'); values.push(data.expenses.other); }
        }

        if (data.note !== undefined) { fields.push('note = ?'); values.push(data.note); }

        if (fields.length === 0) return this.findOne({ date });

        db.prepare(`UPDATE daily_records SET ${fields.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE date = ?`)
            .run(...values, date);

        return this.findOne({ date });
    }
};

module.exports = DailyRecordService;
