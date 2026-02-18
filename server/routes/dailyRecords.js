const express = require('express');
const DailyRecordService = require('../services/dailyRecordService');
const auth = require('../middleware/auth');
const router = express.Router();

// Delete all records
router.delete('/delete-all', auth, async (req, res) => {
    try {
        // Need to add deleteMany to service or just implement here
        // For simplicity let's assume we implement it in service or use raw db
        const { db } = require('../database');
        db.prepare('DELETE FROM daily_records').run();
        res.send({ message: 'All daily records deleted' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Get all records (sorted by date descending)
router.get('/', auth, async (req, res) => {
    try {
        const { db } = require('../database');
        const records = db.prepare('SELECT * FROM daily_records ORDER BY date DESC').all();
        // Format to mimic Mongoose output if needed (e.g. nested expenses)
        const formatted = records.map(r => ({
            ...r,
            _id: r.id,
            expenses: {
                delivery: r.deliveryExpense,
                fuel: r.fuelExpense,
                other: r.otherExpense
            }
        }));
        res.send(formatted);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Create or Update record for a specific date
router.post('/', auth, async (req, res) => {
    try {
        // Prepare data
        const dateStr = req.body.date.split('T')[0]; // Simple date string for SQLite

        // Get existing
        const existing = await DailyRecordService.findOne({ date: dateStr });
        let record;
        if (existing) {
            record = await DailyRecordService.update(dateStr, req.body);
        } else {
            record = await DailyRecordService.create({ ...req.body, date: dateStr });
        }

        res.status(201).send(record);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Update specific fields
router.patch('/:id', auth, async (req, res) => {
    try {
        const { db } = require('../database');
        const row = db.prepare('SELECT date FROM daily_records WHERE id = ?').get(req.params.id);
        if (!row) return res.status(404).send();

        const record = await DailyRecordService.update(row.date, req.body);
        res.send(record);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Delete record
router.delete('/:id', auth, async (req, res) => {
    try {
        const { db } = require('../database');
        const record = db.prepare('SELECT * FROM daily_records WHERE id = ?').get(req.params.id);
        if (!record) return res.status(404).send();

        db.prepare('DELETE FROM daily_records WHERE id = ?').run(req.params.id);
        res.send({ ...record, _id: record.id });
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
