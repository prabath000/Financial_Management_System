const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Customer = require('./models/Customer');
const Transaction = require('./models/Transaction');

dotenv.config();

async function debugCustomer() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const customer = await Customer.findOne({ name: 'Prabath' });
        console.log('Customer ID:', customer._id.toString());

        const transactions = await Transaction.find({ customer: customer._id });
        console.log(`Found ${transactions.length} transactions for customer.`);

        let p = 0;
        let c = 0;
        transactions.forEach(t => {
            console.log(`- ${t.type} | ${t.status} | ${t.amount} (Type: ${typeof t.amount})`);
            if (t.type === 'Credit' || t.type === 'Cheque') {
                const factor = t.type === 'Credit' ? 1 : -1;
                if (t.status === 'Confirmed') c += (t.amount * factor);
                else p += (t.amount * factor);
            }
        });

        console.log(`Calculated -> Pending: ${p}, Confirmed: ${c}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debugCustomer();
