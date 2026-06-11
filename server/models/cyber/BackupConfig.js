// models/cyber/BackupConfig.js

const mongoose = require('mongoose');

const backupConfigSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', default: null },
  enabled: { type: Boolean, default: false },
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'manual'], default: 'weekly' },
  time: { type: String, default: '02:00' },
  dayOfWeek: { type: Number, default: 0 },
  dayOfMonth: { type: Number, default: 1 },
  retentionDays: { type: Number, default: 30 },
  emailEnabled: { type: Boolean, default: true },
  emailRecipients: [{ type: String, trim: true, lowercase: true }],
  collections: [{ type: String }],
  lastRunAt: { type: Date },
  nextRunAt: { type: Date },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// No index on tenantId — let the application handle uniqueness logic
module.exports = backupConfigSchema;