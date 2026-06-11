// models/cyber/Account.js
const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Tenant' },
  type: { type: String, enum: ['in', 'out'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true, trim: true },
  category: { type: String, trim: true },
  date: { type: Date, default: Date.now },
  reference: { type: String, trim: true },
}, { timestamps: true });

accountSchema.index({ tenantId: 1, date: -1 });

module.exports = accountSchema;