// models/cyber/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Tenant' },
  type: { type: String, enum: ['subscription', 'mpesa', 'other'], default: 'other' },
  amount: { type: Number, required: true },
  description: { type: String, required: true, trim: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  mpesaReceipt: { type: String, trim: true },
  mpesaPhone: { type: String, trim: true },
  reference: { type: String, trim: true },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

transactionSchema.index({ tenantId: 1, date: -1 });
transactionSchema.index({ status: 1 });

module.exports = transactionSchema;