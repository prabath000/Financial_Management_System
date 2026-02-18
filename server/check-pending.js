const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Transaction = require('./models/Transaction');

dotenv.config();

async function checkPending() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const count = await Transaction.countDocuments({ status: 'Pending' });
        console.log(`Total Pending Transactions: ${count}`);

        const pending = await Transaction.find({ status: 'Pending' }).populate('customer');
        pending.forEach(t => {
            console.log(`- Pending: ${t.type} | ${t.amount} | ${t.customer?.name}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkPending();
