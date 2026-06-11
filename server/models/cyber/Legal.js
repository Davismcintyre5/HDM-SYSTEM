// models/cyber/Legal.js
const mongoose = require('mongoose');

const legalSchema = new mongoose.Schema({
  terms: { type: String, default: '' },
  privacy: { type: String, default: '' },
  refund: { type: String, default: '' },
}, { timestamps: true });

module.exports = legalSchema;