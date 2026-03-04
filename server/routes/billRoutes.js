const express = require('express');
const Bill    = require('../models/Bill');
const Item    = require('../models/Item');
const { protect } = require('../middleware/authMiddleware');
const router  = express.Router();

router.use(protect);

// Stats for dashboard
router.get('/stats', async (req, res) => {
  try {
    const totalBills   = await Bill.countDocuments();
    const totalItems   = await Item.countDocuments();
    const paidBills    = await Bill.find({ paymentStatus: 'Paid' });
    const pendingCount = await Bill.countDocuments({ paymentStatus: 'Pending' });
    const totalRevenue = paidBills.reduce((s, b) => s + b.grandTotal, 0);
    const today = new Date(); today.setHours(0,0,0,0);
    const todayBills   = await Bill.find({ paymentStatus: 'Paid', createdAt: { $gte: today } });
    const todayRevenue = todayBills.reduce((s, b) => s + b.grandTotal, 0);
    res.json({ success: true, stats: { totalBills, totalItems, totalRevenue, pendingCount, todayRevenue, todaySales: todayBills.length } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/', async (req, res) => {
  try {
    const { search, status } = req.query;
    const q = {};
    if (search) q.$or = [{ billNo: { $regex: search, $options: 'i' } }, { 'customer.name': { $regex: search, $options: 'i' } }, { 'customer.phone': { $regex: search, $options: 'i' } }];
    if (status) q.paymentStatus = status;
    const bills = await Bill.find(q).populate('createdBy', 'name').sort({ createdAt: -1 });
    res.json({ success: true, count: bills.length, bills });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate('createdBy', 'name');
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, bill });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { customer, items, paymentMethod, paymentStatus, amountPaid, notes } = req.body;
    if (!customer?.name) return res.status(400).json({ success: false, message: 'Customer name required' });
    if (!items?.length)  return res.status(400).json({ success: false, message: 'At least one item required' });

    let subTotal = 0, totalDiscount = 0, totalTax = 0;
    const processed = [];

    for (const bi of items) {
      const dbItem = await Item.findById(bi.itemId);
      if (!dbItem) return res.status(404).json({ success: false, message: `Item not found: ${bi.itemId}` });
      if (dbItem.quantity < bi.quantity)
        return res.status(400).json({ success: false, message: `Insufficient stock for "${dbItem.itemName}". Available: ${dbItem.quantity}` });

      const qty      = Number(bi.quantity);
      const sub      = dbItem.price * qty;
      const discAmt  = (sub * dbItem.discount) / 100;
      const afterD   = sub - discAmt;
      const taxAmt   = (afterD * dbItem.tax) / 100;
      const total    = afterD + taxAmt;

      subTotal += sub; totalDiscount += discAmt; totalTax += taxAmt;

      processed.push({ item: dbItem._id, itemNo: dbItem.itemNo, itemName: dbItem.itemName, category: dbItem.category, quantity: qty, unitPrice: dbItem.price, discount: dbItem.discount, tax: dbItem.tax, subtotal: sub, discountAmt: discAmt, taxAmt, total });
      await Item.findByIdAndUpdate(dbItem._id, { $inc: { quantity: -qty } });
    }

    const grandTotal = subTotal - totalDiscount + totalTax;
    const bill = await Bill.create({ customer, items: processed, subTotal: +subTotal.toFixed(2), totalDiscount: +totalDiscount.toFixed(2), totalTax: +totalTax.toFixed(2), grandTotal: +grandTotal.toFixed(2), paymentMethod: paymentMethod || 'Cash', paymentStatus: paymentStatus || 'Pending', amountPaid: amountPaid || 0, notes, createdBy: req.user._id });
    res.status(201).json({ success: true, message: 'Bill created', bill });
  } catch (e) {
    const msg = e.name === 'ValidationError' ? Object.values(e.errors)[0].message : e.message;
    res.status(400).json({ success: false, message: msg });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const bill = await Bill.findByIdAndUpdate(req.params.id, { paymentStatus: req.body.paymentStatus, amountPaid: req.body.amountPaid }, { new: true });
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, bill });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const bill = await Bill.findByIdAndDelete(req.params.id);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, message: 'Bill deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
