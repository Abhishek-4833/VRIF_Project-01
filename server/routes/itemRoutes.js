const express = require('express');
const Item    = require('../models/Item');
const { protect } = require('../middleware/authMiddleware');
const router  = express.Router();

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    const q = {};
    if (search)   q.$or = [{ itemNo: { $regex: search, $options: 'i' } }, { itemName: { $regex: search, $options: 'i' } }];
    if (category) q.category = category;
    const items = await Item.find(q).sort({ createdAt: -1 });
    res.json({ success: true, count: items.length, items });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, item });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const item = await Item.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, message: 'Item created', item });
  } catch (e) {
    const msg = e.code === 11000 ? 'Item number already exists' : e.name === 'ValidationError' ? Object.values(e.errors)[0].message : e.message;
    res.status(400).json({ success: false, message: msg });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Item updated', item });
  } catch (e) {
    const msg = e.code === 11000 ? 'Item number already exists' : e.name === 'ValidationError' ? Object.values(e.errors)[0].message : e.message;
    res.status(400).json({ success: false, message: msg });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Item deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
