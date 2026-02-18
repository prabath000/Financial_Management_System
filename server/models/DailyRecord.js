const mongoose = require('mongoose');

const dailyRecordSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true
    },
    grossSale: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    netReturn: { type: Number, default: 0 },
    chequeSale: { type: Number, default: 0 },
    creditSale: { type: Number, default: 0 },
    cashSale: { type: Number, default: 0 },
    expenses: {
        delivery: { type: Number, default: 0 },
        fuel: { type: Number, default: 0 },
        other: { type: Number, default: 0 }
    },
    note: { type: String }
}, { timestamps: true });

// Virtual for Total Income (Cash + Credit + Cheque) - Validated via frontend, but good to have
dailyRecordSchema.virtual('totalIncome').get(function () {
    return this.cashSale + this.creditSale + this.chequeSale;
});

// Virtual for Total Expenses
dailyRecordSchema.virtual('totalExpenses').get(function () {
    return this.expenses.delivery + this.expenses.fuel + this.expenses.other;
});

module.exports = mongoose.model('DailyRecord', dailyRecordSchema);
