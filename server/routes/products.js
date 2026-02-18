const express = require('express');
const router = express.Router();
const ProductService = require('../services/productService');
const auth = require('../middleware/auth');

// Get all products
router.get('/', auth, (req, res) => {
    try {
        const products = ProductService.getAll();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get product by ID
router.get('/:id', auth, (req, res) => {
    try {
        const product = ProductService.getById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create product
router.post('/', auth, (req, res) => {
    try {
        const product = ProductService.create(req.body);
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update product
router.patch('/:id', auth, (req, res) => {
    try {
        const product = ProductService.update(req.params.id, req.body);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete product
router.delete('/:id', auth, (req, res) => {
    try {
        const product = ProductService.delete(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Product deleted', product });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
