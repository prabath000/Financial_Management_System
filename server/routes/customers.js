const express = require('express');
const CustomerService = require('../services/customerService');
const TransactionService = require('../services/transactionService');
const auth = require('../middleware/auth');
const router = express.Router();

// Delete all customers
router.delete('/delete-all', auth, async (req, res) => {
    try {
        await TransactionService.deleteMany({});
        await CustomerService.deleteAll();
        res.send({ message: 'All customers and their transactions deleted' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Get all customers
router.get('/', auth, async (req, res) => {
    try {
        const customers = await CustomerService.findAll();
        res.send(customers);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Create new customer
router.post('/', auth, async (req, res) => {
    try {
        const customer = await CustomerService.create(req.body);
        res.status(201).send(customer);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Get customer by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const customer = await CustomerService.findById(req.params.id);
        if (!customer) return res.status(404).send();
        res.send(customer);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update customer
router.patch('/:id', auth, async (req, res) => {
    try {
        const customer = await CustomerService.update(req.params.id, req.body);
        if (!customer) return res.status(404).send();
        res.send(customer);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete customer
router.delete('/:id', auth, async (req, res) => {
    try {
        const customer = await CustomerService.delete(req.params.id);
        if (!customer) return res.status(404).send();
        res.send(customer);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
