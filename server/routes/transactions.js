const express = require('express');
const TransactionService = require('../services/transactionService');
const CustomerService = require('../services/customerService');
const auth = require('../middleware/auth');
const router = express.Router();

// Delete all transactions
router.delete('/delete-all', auth, async (req, res) => {
    try {
        await TransactionService.deleteMany({});
        // Reset all customer balances
        const customers = await CustomerService.findAll();
        for (const customer of customers) {
            await CustomerService.update(customer._id, { creditBalance: 0, pendingBalance: 0 });
        }
        res.send({ message: 'All transactions deleted and balances reset' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Helper to accurately recalculate customer balances
async function updateCustomerBalances(customerId) {
    if (!customerId) return;
    try {
        const transactions = await TransactionService.findAll({ customer: customerId });
        let pending = 0;
        let confirmed = 0;

        transactions.forEach(t => {
            if (t.type === 'Credit' || t.type === 'Cheque' || t.type === 'Cash') {
                const factor = t.type === 'Credit' ? 1 : -1;
                const amount = t.amount * factor;
                if (t.status === 'Confirmed') {
                    confirmed += amount;
                } else {
                    pending += amount;
                }
            }
        });

        await CustomerService.update(customerId, {
            pendingBalance: pending,
            creditBalance: confirmed
        });
        console.log(`Recalculated balances for customer ${customerId}: Pending: ${pending}, Confirmed: ${confirmed}`);
    } catch (err) {
        console.error('Error updating customer balances:', err);
    }
}

// Get all transactions
router.get('/', auth, async (req, res) => {
    try {
        const query = {};
        if (req.query.customer) {
            query.customer = req.query.customer;
        }
        const transactions = await TransactionService.findAll(query);
        res.send(transactions);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Create new transaction
router.post('/', auth, async (req, res) => {
    try {
        const data = { ...req.body };

        // Auto-confirm Cash, set others to Pending
        if (data.type === 'Cash') {
            data.status = 'Confirmed';
        } else {
            data.status = 'Pending';
        }

        const transaction = await TransactionService.create(data);

        // Recalculate customer balance
        if (transaction.customerId) {
            await updateCustomerBalances(transaction.customerId);
        }

        res.status(201).send(transaction);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Income Analysis / Analytics
router.get('/analytics/income', auth, async (req, res) => {
    try {
        const analytics = await TransactionService.getAnalytics();
        res.send(analytics);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update transaction
router.patch('/:id', auth, async (req, res) => {
    try {
        const oldTransaction = await TransactionService.findById(req.params.id);
        if (!oldTransaction) return res.status(404).send();

        // 1. Apply updates
        const transaction = await TransactionService.update(req.params.id, req.body);

        // 2. Recalculate balances (handle case where customer might have changed)
        if (oldTransaction.customerId) await updateCustomerBalances(oldTransaction.customerId);
        if (transaction.customerId && transaction.customerId !== oldTransaction.customerId) {
            await updateCustomerBalances(transaction.customerId);
        }

        res.send(transaction);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Delete transaction
router.delete('/:id', auth, async (req, res) => {
    try {
        const transaction = await TransactionService.findById(req.params.id);
        if (!transaction) return res.status(404).send();

        await TransactionService.delete(req.params.id);

        // Recalculate balance
        const cId = transaction.customerId || (transaction.customer && transaction.customer._id);
        if (cId) {
            await updateCustomerBalances(cId);
        }

        res.send(transaction);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Confirm transaction
router.patch('/:id/confirm', auth, async (req, res) => {
    try {
        const transaction = await TransactionService.findById(req.params.id);
        if (!transaction) return res.status(404).send();
        if (transaction.status === 'Confirmed') return res.status(400).send({ error: 'Transaction already confirmed' });

        const updated = await TransactionService.update(req.params.id, { status: 'Confirmed' });

        // Recalculate balance
        if (updated.customerId) {
            await updateCustomerBalances(updated.customerId);
        }

        res.send(updated);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Recalculate all customer balances (Self-heal utility)
router.post('/recalculate-all', auth, async (req, res) => {
    try {
        const customers = await CustomerService.findAll();
        for (const customer of customers) {
            await updateCustomerBalances(customer._id);
        }
        res.send({ message: 'All customer balances recalculated successfully' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;
