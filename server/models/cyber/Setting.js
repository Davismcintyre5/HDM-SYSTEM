// models/cyber/Setting.js
const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, ref: 'Tenant' },
  businessName: { type: String, trim: true },
  address: { type: String, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true },
  logo: { type: String, trim: true },
  currency: { type: String, default: 'KES' },
  timezone: { type: String, default: 'Africa/Nairobi' },
  receiptFooter: { type: String, trim: true },
}, { timestamps: true });

module.exports = settingSchema;