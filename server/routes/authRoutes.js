const express = require('express');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const router  = express.Router();

const genToken = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, storeName, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password required' });
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(400).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email, password, storeName, role });
    res.status(201).json({ success: true, token: genToken(user._id), user: { _id: user._id, name: user.name, email: user.email, role: user.role, storeName: user.storeName } });
  } catch (err) {
    const msg = err.name === 'ValidationError' ? Object.values(err.errors)[0].message : err.message;
    res.status(400).json({ success: false, message: msg });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    res.json({ success: true, token: genToken(user._id), user: { _id: user._id, name: user.name, email: user.email, role: user.role, storeName: user.storeName } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Me
router.get('/me', protect, (req, res) => res.json({ success: true, user: req.user }));

module.exports = router;
