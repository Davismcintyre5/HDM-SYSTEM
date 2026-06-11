// models/cyber/SupportTicket.js
const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  adminReply: { type: String, trim: true },
  repliedAt: { type: Date },
  resolvedAt: { type: Date },
}, { timestamps: true });

supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ tenantId: 1 });

module.exports = supportTicketSchema;