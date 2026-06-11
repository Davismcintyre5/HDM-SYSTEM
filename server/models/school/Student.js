// models/school/Student.js

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  regNumber: { type: String, unique: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  age: { type: Number },
  gender: { type: String, enum: ['male', 'female', 'other', 'Male', 'Female', 'Other'] },
  idNumber: { type: String, trim: true },
  course: { type: String, required: true },
  enrollmentDate: { type: Date, default: Date.now },
  completionDate: { type: Date },
  feesPaid: { type: Number, default: 0 },
  computerAssigned: { type: String },
  certificateNumber: { type: String },
  status: { type: String, enum: ['active', 'completed', 'suspended', 'dropped'], default: 'active' },
  address: { type: String, trim: true },
  notes: { type: String, trim: true },
}, { timestamps: true });

module.exports = studentSchema;