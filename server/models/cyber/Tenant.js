// models/cyber/Tenant.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const tenantSchema = new mongoose.Schema({
  businessName: { type: String, required: true, trim: true },
  ownerName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, trim: true },
  address: { type: String, trim: true },
  plan: { type: String, enum: ['trial', 'monthly', 'yearly'], default: 'trial' },
  status: { type: String, enum: ['active', 'pending', 'expired', 'suspended', 'cancelled'], default: 'pending' },
  trialStartDate: { type: Date },
  trialEndDate: { type: Date },
  subscriptionStartDate: { type: Date },
  subscriptionEndDate: { type: Date },
  autoRenew: { type: Boolean, default: true },
  lastLogin: { type: Date },
  active: { type: Boolean, default: true },
}, { timestamps: true });

tenantSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

tenantSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

tenantSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

tenantSchema.methods.isSubscriptionActive = function () {
  if (this.plan === 'trial') return this.trialEndDate && new Date() < this.trialEndDate;
  return this.subscriptionEndDate && new Date() < this.subscriptionEndDate;
};

module.exports = tenantSchema;