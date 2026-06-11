// models/school/BackupConfig.js
const mongoose = require('mongoose');

const backupConfigSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: true },
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

module.exports = backupConfigSchema;