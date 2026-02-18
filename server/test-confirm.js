const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Customer = require('./models/Customer');
const Transaction = require('./models/Transaction');

dotenv.config();

async function testConfirm() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Find a customer
        const customer = await Customer.findOne({ name: /prabath/i });
        console.log(`Original Balance - Pending: ${customer.pendingBalance}, Confirmed: ${customer.creditBalance}`);

        // Create a fake pending transaction
        const t = new Transaction({
            amount: 5000,
            type: 'Credit',
            customer: customer._id,
            status: 'Pending',
            description: 'Test Pending'
        });
        await t.save();

        // Apply POST logic manually
        customer.pendingBalance += 5000;
        await customer.save();
        console.log(`After POST - Pending: ${customer.pendingBalance}, Confirmed: ${customer.creditBalance}`);

        // Apply CONFIRM logic manually (replicating the route)
        t.status = 'Confirmed';
        await t.save();

        const factor = t.type === 'Credit' ? 1 : -1;
        const impact = t.amount * factor;

        customer.pendingBalance -= impact;
        customer.creditBalance += impact;
        await customer.save();

        console.log(`After CONFIRM - Pending: ${customer.pendingBalance}, Confirmed: ${customer.creditBalance}`);

        // Cleanup
        await Transaction.findByIdAndDelete(t._id);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testConfirm();
