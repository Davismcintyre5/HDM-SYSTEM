// models/school/Settings.js

const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  schoolName: { type: String, default: 'HDM Computer School' },
  motto: { type: String, default: 'Technology for Tomorrow' },
  address: { type: String, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true },
  logo: { type: String, trim: true },
  stampImage: { type: String, trim: true },
  receiptFooterText: { type: String, trim: true },

  courses: [{
    name: { type: String, required: true },
    description: { type: String },
    durationMonths: { type: Number },
    totalFee: { type: Number, default: 0 },
    requirements: { type: String },
    brochure: { type: String },
  }],

  landing: {
    heroImage: { type: String },
    aboutText: { type: String },
    gallery: [{ url: String, caption: String }],
  },

  computers: {
    mode: { type: String, enum: ['range', 'manual'], default: 'range' },
    defaultValue: { type: Number, default: 0 },
    range: { start: { type: Number, default: 1 }, end: { type: Number, default: 30 }, prefix: { type: String, default: 'PC-' } },
    manualList: [{ name: String, value: Number }],
  },

  syncComputersToInventory: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = settingsSchema;