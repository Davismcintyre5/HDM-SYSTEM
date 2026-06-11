// models/school/PortalUser.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const portalUserSchema = new mongoose.Schema({
  regNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'staff'], default: 'student' },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  active: { type: Boolean, default: true },
  lastLogin: { type: Date },
}, { timestamps: true });

portalUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

portalUserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

portalUserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = portalUserSchema;