// models/cyber/Invoice.js

const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Tenant' },
  invoiceNumber: { type: String, required: true },
  customerName: { type: String, required: true, trim: true },
  customerEmail: { type: String, trim: true, lowercase: true },
  customerPhone: { type: String, trim: true },
  items: [{
    serviceId: { type: mongoose.Schema.Types.ObjectId },
    name: String,
    price: Number,
    quantity: Number,
  }],
  subtotal: { type: Number, required: true },
  total: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  balance: { type: Number },
  status: { type: String, enum: ['draft', 'sent', 'paid', 'cancelled'], default: 'draft' },
  paymentMethod: { type: String, enum: ['cash', 'mpesa', 'bank', 'other'], default: 'cash' },
  notes: { type: String, trim: true },
  sentAt: { type: Date },
  paidAt: { type: Date },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

invoiceSchema.index({ tenantId: 1, status: 1 });
invoiceSchema.index({ invoiceNumber: 1 });

module.exports = invoiceSchema;