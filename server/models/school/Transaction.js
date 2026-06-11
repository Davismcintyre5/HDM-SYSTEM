// models/school/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['in', 'out'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true, trim: true },
  reference: { type: String, trim: true },
  category: { type: String, trim: true },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

transactionSchema.index({ date: -1 });
transactionSchema.index({ type: 1, date: -1 });

module.exports = transactionSchema;