const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemNo:      { type: String, required: true, unique: true, trim: true, uppercase: true },
  itemName:    { type: String, required: true, trim: true },
  category:    { type: String, required: true, enum: ['Shirts','T-Shirts','Pants','Jeans','Kurtas','Sarees','Lehengas','Suits','Jackets','Blazers','Accessories','Kids Wear','Sportswear','Other'] },
  quantity:    { type: Number, required: true, min: 0, default: 0 },
  price:       { type: Number, required: true, min: 0 },
  discount:    { type: Number, default: 0, min: 0, max: 100 },
  tax:         { type: Number, default: 0, min: 0 },
  brand:       { type: String, trim: true },
  size:        { type: String, trim: true },
  color:       { type: String, trim: true },
  description: { type: String, trim: true },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
