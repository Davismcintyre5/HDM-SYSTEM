// models/school/Fee.js
const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  regNumber: { type: String, required: true },
  studentName: { type: String, required: true },
  amount: { type: Number, required: true },
  balanceAfter: { type: Number },
  date: { type: Date, default: Date.now },
  notes: { type: String, trim: true },
  paymentMethod: { type: String, enum: ['cash', 'mpesa', 'bank', 'other'], default: 'cash' },
  mpesaCode: { type: String, trim: true },
}, { timestamps: true });

feeSchema.index({ regNumber: 1, date: -1 });

module.exports = feeSchema;