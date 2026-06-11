// models/school/Application.js
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  course: { type: String, required: true },
  message: { type: String, trim: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  admissionLetterGenerated: { type: Boolean, default: false },
  appliedDate: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = applicationSchema;