// models/cyber/Backup.js
const mongoose = require('mongoose');

const backupSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
  filename: { type: String, required: true },
  size: { type: Number },
  collections: [{ type: String }],
  recordCounts: { type: Map, of: Number },
  status: { type: String, enum: ['in_progress', 'completed', 'failed'], default: 'in_progress' },
  type: { type: String, enum: ['manual', 'scheduled'], default: 'manual' },
  emailSent: { type: Boolean, default: false },
  emailRecipient: { type: String },
  errorMessage: { type: String },
  createdAt: { type: Date, default: Date.now },
});

backupSchema.index({ tenantId: 1, createdAt: -1 });

module.exports = backupSchema;