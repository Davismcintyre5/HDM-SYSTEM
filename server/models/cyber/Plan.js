// models/cyber/Plan.js
const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['monthly', 'yearly'], required: true },
  price: { type: Number, required: true },
  trialDays: { type: Number, default: 14 },
  features: [{ type: String }],
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = planSchema;