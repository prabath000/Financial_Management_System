const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Customer = require('./models/Customer');
const Transaction = require('./models/Transaction');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Check if admin exists
        const existingAdmin = await User.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log('Admin user already exists');
        } else {
            const admin = new User({
                username: 'admin',
                password: 'adminpassword123'
            });

            await admin.save();
            console.log('Admin user created successfully!');
        }
    } catch (error) {
        if (error.code !== 11000) console.error('Error creating admin:', error);
    }

    try {
        // Seed Customers
        const existingCustomers = await Customer.find();
        let customers = [];
        if (existingCustomers.length === 0) {
            customers = await Customer.insertMany([
                { name: 'John Doe', phone: '0771234567', address: 'Colombo', creditBalance: 5000 },
                { name: 'Jane Smith', phone: '0719876543', address: 'Kandy', creditBalance: 0 }
            ]);
            console.log('Sample customers created!');
        } else {
            customers = existingCustomers;
        }

        // Seed Transactions
        const existingTransactions = await Transaction.countDocuments();
        if (existingTransactions === 0 && customers.length > 0) {
            await Transaction.insertMany([
                { amount: 1500, type: 'Cash', description: 'Initial cash sale' },
                { amount: 5000, type: 'Credit', customer: customers[0]._id, description: 'Credit purchase' },
                { amount: 2000, type: 'Cheque', chequeNumber: 'CHQ1001', chequeDate: new Date(), description: 'Payment for stock' }
            ]);
            console.log('Sample transactions created!');
        }

        process.exit(0);

    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedAdmin();
