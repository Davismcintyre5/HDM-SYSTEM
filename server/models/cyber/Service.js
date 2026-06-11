// models/cyber/Service.js
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Tenant' },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  price: { type: Number, default: 0 },
  category: { type: String, trim: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

serviceSchema.index({ tenantId: 1, name: 1 });

module.exports = serviceSchema;