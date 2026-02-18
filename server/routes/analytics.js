const express = require('express');
const { db } = require('../database');
const auth = require('../middleware/auth');
const router = express.Router();

// GET Global Dashboard Summary
router.get('/summary', auth, async (req, res) => {
    try {
        // 1. Transaction Totals
        const t = db.prepare(`
            SELECT 
                SUM(CASE WHEN type = 'Cash' THEN amount ELSE 0 END) as cash,
                SUM(CASE WHEN type = 'Credit' THEN amount ELSE 0 END) as credit,
                SUM(CASE WHEN type = 'Cheque' THEN amount ELSE 0 END) as cheque
            FROM transactions 
            WHERE status = 'Confirmed'
        `).get();

        // 2. Outstanding Customer Credit
        const c = db.prepare(`
            SELECT SUM(creditBalance) as totalOutstanding FROM customers
        `).get();

        // 3. Combine
        const summary = {
            cash: t.cash || 0,
            credit: t.credit || 0,
            cheque: t.cheque || 0,
            total: (t.cash || 0) + (t.credit || 0) + (t.cheque || 0),
            outstandingCredit: c.totalOutstanding || 0
        };

        res.json(summary);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// GET Combined Monthly Analytics for Chart
router.get('/monthly', auth, async (req, res) => {
    try {
        // SQLite equivalent of month extraction depends on date format. 
        // Assuming ISO string "YYYY-MM-DD..." or similar.
        const transMonthly = db.prepare(`
            SELECT 
                CAST(strftime('%m', date) AS INTEGER) as month,
                SUM(CASE WHEN type = 'Cash' THEN amount ELSE 0 END) as cash,
                SUM(CASE WHEN type = 'Credit' THEN amount ELSE 0 END) as credit,
                SUM(CASE WHEN type = 'Cheque' THEN amount ELSE 0 END) as cheque
            FROM transactions 
            WHERE status = 'Confirmed'
            GROUP BY month
        `).all();

        // Merge results
        const finalData = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            cash: 0,
            credit: 0,
            cheque: 0
        }));

        transMonthly.forEach(m => {
            if (m.month >= 1 && m.month <= 12) {
                finalData[m.month - 1].cash = m.cash || 0;
                finalData[m.month - 1].credit = m.credit || 0;
                finalData[m.month - 1].cheque = m.cheque || 0;
            }
        });

        // Filter out months with no data
        const filteredData = finalData.filter(m => (m.cash + m.credit + m.cheque) > 0);

        res.json(filteredData);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// GET Daily Analytics for a specific month
router.get('/daily', auth, async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ error: 'Month and year are required' });
        }

        // Adjust month for SQLite strftime format (01-12)
        const formattedMonth = month.toString().padStart(2, '0');

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
        `).all(formattedMonth, year);

        // Fill in missing days
        const daysInMonth = new Date(year, month, 0).getDate();
        const fullMonthData = Array.from({ length: daysInMonth }, (_, i) => ({
            day: i + 1,
            cash: 0,
            credit: 0,
            cheque: 0
        }));

        dailyData.forEach(d => {
            if (d.day >= 1 && d.day <= daysInMonth) {
                fullMonthData[d.day - 1] = {
                    day: d.day,
                    cash: d.cash || 0,
                    credit: d.credit || 0,
                    cheque: d.cheque || 0
                };
            }
        });

        res.json(fullMonthData);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// GET Inventory Analytics
router.get('/inventory', auth, async (req, res) => {
    try {
        const inventory = db.prepare(`
            SELECT name, quantity, alertLevel 
            FROM products 
            ORDER BY quantity ASC 
            LIMIT 15
        `).all();
        res.json(inventory);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// GET Daily Business Sheet Analytics
router.get('/daily-sheet', auth, async (req, res) => {
    try {
        // Last 30 days of records
        const records = db.prepare(`
            SELECT 
                date,
                (cashSale + creditSale + chequeSale) as income,
                (deliveryExpense + fuelExpense + otherExpense) as expenses
            FROM daily_records 
            ORDER BY date DESC 
            LIMIT 30
        `).all();
        res.json(records.reverse());
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// GET Customer Credit Analytics
router.get('/credit', auth, async (req, res) => {
    try {
        const topDebtors = db.prepare(`
            SELECT name, creditBalance 
            FROM customers 
            WHERE creditBalance > 0 
            ORDER BY creditBalance DESC 
            LIMIT 10
        `).all();
        res.json(topDebtors);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;
