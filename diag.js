const mongoose = require('mongoose');
const DailyRecord = require('./server/models/DailyRecord');
require('dotenv').config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/untitled');
        const count = await DailyRecord.countDocuments();
        const records = await DailyRecord.find().limit(5);
        console.log('Total DailyRecords:', count);
        console.log('Sample Records:', JSON.stringify(records, null, 2));

        const stats = await DailyRecord.aggregate([
            {
                $group: {
                    _id: null,
                    cash: { $sum: { $toDouble: { $ifNull: ["$cashSale", 0] } } },
                    credit: { $sum: { $toDouble: { $ifNull: ["$creditSale", 0] } } },
                    cheque: { $sum: { $toDouble: { $ifNull: ["$chequeSale", 0] } } }
                }
            }
        ]);
        console.log('Aggregation Result:', JSON.stringify(stats, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
