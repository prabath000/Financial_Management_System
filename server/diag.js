const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Customer = require('./models/Customer');
const Transaction = require('./models/Transaction');

dotenv.config();

async function diag() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('--- Diagnostic Report ---');

        const transactions = await Transaction.find({}).populate('customer').sort({ date: -1 }).limit(10);
        console.log('Recent Transactions:');
        transactions.forEach(t => {
            console.log(`[${t.status}] ${t.type} | Amount: ${t.amount} | Customer: ${t.customer?.name || 'N/A'}`);
        });

        const customers = await Customer.find({});
        console.log('\nCustomer Balances:');
        customers.forEach(c => {
            console.log(`${c.name}: Pending: ${c.pendingBalance}, Confirmed: ${c.creditBalance}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

diag();
