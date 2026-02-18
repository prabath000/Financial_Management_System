const axios = require('axios');
const { db } = require('./server/database');

async function testDailyAnalytics() {
    try {
        console.log("Testing /analytics/daily endpoint logic directly...");

        const now = new Date();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const year = now.getFullYear().toString();

        console.log(`Fetching for Month: ${month}, Year: ${year}`);

        const dailyData = db.prepare(`
            SELECT 
                CAST(strftime('%d', date) AS INTEGER) as day,
                SUM(CASE WHEN type = 'Cash' THEN amount ELSE 0 END) as cash,
                SUM(CASE WHEN type = 'Credit' THEN amount ELSE 0 END) as credit,
                SUM(CASE WHEN type = 'Cheque' THEN amount ELSE 0 END) as cheque
            FROM transactions 
            WHERE status = 'Confirmed' 
            AND strftime('%m', date) = ? 
            AND strftime('%Y', date) = ?
            GROUP BY day
            ORDER BY day
        `).all(month, year);

        console.log("Database Query Result:", dailyData);

        if (dailyData.length === 0) {
            console.log("No data found for this month in DB.");
        } else {
            console.log("Data found!");
        }

    } catch (err) {
        console.error("Test Failed:", err);
    }
}

testDailyAnalytics();
