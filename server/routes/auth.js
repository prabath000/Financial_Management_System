const express = require('express');
const jwt = require('jsonwebtoken');
const UserService = require('../services/userService');
const router = express.Router();

// Register Admin (Optional/Initial)
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await UserService.register({ username, password });
        res.status(201).send({ message: 'Admin registered successfully', user });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Login Admin
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await UserService.findOne({ username });
        if (!user) {
            console.log(`Login failed: User ${username} not found`);
            return res.status(401).send({ error: 'Invalid login credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log(`Login failed: Incorrect password for ${username}`);
            return res.status(401).send({ error: 'Invalid login credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.send({ user, token });
    } catch (error) {
        console.error('CRITICAL LOGIN ERROR:', error.message);
        console.error(error.stack);
        res.status(400).send({ error: error.message });
    }
});

module.exports = router;
