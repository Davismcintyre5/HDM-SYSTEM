// models/school/Inventory.js

const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  type: { type: String, required: true, trim: true },
  value: { type: Number, default: 0 },
  status: { type: String, enum: ['Available', 'Assigned', 'Maintenance', 'Retired'], default: 'Available' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, default: null },
  assignedModel: { type: String, enum: ['Student', 'Employee', null], default: null },
  serialNumber: { type: String, trim: true },
  purchaseDate: { type: Date },
  notes: { type: String, trim: true },
}, { timestamps: true });

inventorySchema.index({ type: 1, status: 1 });

module.exports = inventorySchema;