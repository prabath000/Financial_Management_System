const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Customer = require('./models/Customer');
const Transaction = require('./models/Transaction');

dotenv.config();

async function syncBalances() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        const customers = await Customer.find({});
        console.log(`Found ${customers.length} customers. Recalculating balances...`);

        for (const customer of customers) {
            const transactions = await Transaction.find({ customer: customer._id });

            let pending = 0;
            let confirmed = 0;

            transactions.forEach(t => {
                if (t.type === 'Credit' || t.type === 'Cheque') {
                    const factor = t.type === 'Credit' ? 1 : -1;
                    const amount = t.amount * factor;

                    if (t.status === 'Confirmed') {
                        confirmed += amount;
                    } else {
                        pending += amount;
                    }
                }
            });

            customer.pendingBalance = pending;
            customer.creditBalance = confirmed;
            await customer.save();

            console.log(`Updated ${customer.name}: Pending: ${pending}, Confirmed: ${confirmed}`);
        }

        console.log('Balance synchronization complete.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

syncBalances();
