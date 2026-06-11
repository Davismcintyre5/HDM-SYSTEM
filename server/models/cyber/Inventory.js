// models/cyber/Inventory.js
const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Tenant' },
  name: { type: String, required: true, trim: true },
  type: { type: String, required: true, trim: true },
  quantity: { type: Number, default: 1 },
  value: { type: Number, default: 0 },
  status: { type: String, enum: ['Available', 'In Use', 'Maintenance', 'Retired'], default: 'Available' },
  serialNumber: { type: String, trim: true },
  notes: { type: String, trim: true },
}, { timestamps: true });

inventorySchema.index({ tenantId: 1, type: 1 });

module.exports = inventorySchema;