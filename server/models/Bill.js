const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
  item:        { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  itemNo:      String,
  itemName:    { type: String, required: true },
  category:    String,
  quantity:    { type: Number, required: true },
  unitPrice:   { type: Number, required: true },
  discount:    { type: Number, default: 0 },
  tax:         { type: Number, default: 0 },
  subtotal:    Number,
  discountAmt: Number,
  taxAmt:      Number,
  total:       { type: Number, required: true },
});

const billSchema = new mongoose.Schema({
  billNo:        { type: String, unique: true },
  customer: {
    name:    { type: String, required: true },
    phone:   String,
    email:   String,
    address: String,
  },
  items:         { type: [billItemSchema], validate: [v => v.length > 0, 'At least one item required'] },
  subTotal:      { type: Number, required: true },
  totalDiscount: { type: Number, default: 0 },
  totalTax:      { type: Number, default: 0 },
  grandTotal:    { type: Number, required: true },
  paymentMethod: { type: String, enum: ['Cash','Card','UPI','Bank Transfer','Other'], default: 'Cash' },
  paymentStatus: { type: String, enum: ['Paid','Pending','Partial'], default: 'Pending' },
  amountPaid:    { type: Number, default: 0 },
  notes:         String,
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

billSchema.pre('save', async function (next) {
  if (!this.billNo) {
    const count = await mongoose.model('Bill').countDocuments();
    const d = new Date();
    const yy = d.getFullYear().toString().slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    this.billNo = `EBF-${yy}${mm}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Bill', billSchema);
