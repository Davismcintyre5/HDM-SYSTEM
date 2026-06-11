// models/school/Employee.js
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  empId: { type: String, unique: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  duty: { type: String, trim: true },
  salary: { type: Number, default: 0 },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  address: { type: String, trim: true },
  notes: { type: String, trim: true },
}, { timestamps: true });

module.exports = employeeSchema;