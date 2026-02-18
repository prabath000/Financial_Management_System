const mongoose = require('mongoose');
const User = require('./models/User');
const Customer = require('./models/Customer');
const Transaction = require('./models/Transaction');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('--- USERS ---');
        console.table(await User.find({}, 'username role'));

        console.log('\n--- CUSTOMERS ---');
        console.table(await Customer.find({}, 'name phone creditBalance'));

        console.log('\n--- TRANSACTIONS ---');
        const transactions = await Transaction.find({}).sort({ date: -1 }).limit(10);
        console.table(transactions.map(t => ({
            date: t.date.toISOString().split('T')[0],
            amount: t.amount,
            type: t.type,
            desc: t.description
        })));

        mongoose.connection.close();
    })
    .catch(err => console.error(err));
