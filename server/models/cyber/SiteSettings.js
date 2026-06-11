// models/cyber/SiteSettings.js

const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'HDM Cyber' },
  contactEmail: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  address: { type: String, default: '' },
  paymentMethods: {
    stkPush: { type: Boolean, default: true },
    sendMoney: { type: Boolean, default: false },
    till: { type: Boolean, default: false },
    paybill: { type: Boolean, default: false },
  },
  mpesaDetails: {
    tillNumber: { type: String, default: '' },
    paybillNumber: { type: String, default: '' },
    sendMoneyNumber: { type: String, default: '' },
  },
}, { timestamps: true });

module.exports = siteSettingsSchema;