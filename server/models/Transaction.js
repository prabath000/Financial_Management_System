const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ['Cash', 'Credit', 'Cheque'],
        required: true,
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        set: v => v === '' ? undefined : v,
        required: function () {
            return this.type === 'Credit';
        }
    },
    chequeNumber: {
        type: String,
        set: v => v === '' ? undefined : v,
        required: function () {
            return this.type === 'Cheque';
        }
    },
    chequeDate: {
        type: Date,
        set: v => v === '' ? undefined : v,
        required: function () {
            return this.type === 'Cheque';
        }
    },
    description: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed'],
        default: 'Confirmed' // Default to confirmed, but we'll override in routes
    }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
