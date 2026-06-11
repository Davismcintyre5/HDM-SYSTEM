// controllers/cyber/admin/mpesaController.js

const { connectCyber } = require('../../../config/db');
const { stkPush, handleCallback } = require('../../../services/mpesaService');
const { sendTemplateEmail } = require('../../../services/emailService');
const { env } = require('../../../config/env');

let cyberConnection;
let Transaction, Tenant, SiteSettings;

const getModels = async () => {
  if (!cyberConnection) cyberConnection = await connectCyber();
  if (!Transaction) {
    Transaction = cyberConnection.model('Transaction');
    Tenant = cyberConnection.model('Tenant');
    SiteSettings = cyberConnection.model('SiteSettings');
  }
  return { Transaction, Tenant, SiteSettings };
};

const getSiteName = async () => {
  try {
    const { SiteSettings } = await getModels();
    const settings = await SiteSettings.findOne();
    return settings?.siteName || env.APP_NAME_CYBER;
  } catch {
    return env.APP_NAME_CYBER;
  }
};

// @desc    Initiate STK Push
// @route   POST /api/cyber/mpesa/stkpush
// @access  Private/Tenant
const initiateStkPush = async (req, res) => {
  try {
    const { phoneNumber, amount, reference } = req.body;
    if (!phoneNumber || !amount) return res.status(400).json({ message: 'Phone number and amount required' });
    const result = await stkPush({
      phoneNumber,
      amount,
      accountReference: reference || 'Subscription',
      transactionDesc: 'Cyber Platform Payment',
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    M-Pesa callback
// @route   POST /api/cyber/mpesa/callback
// @access  Public
const mpesaCallback = async (req, res) => {
  try {
    const { Transaction, Tenant } = await getModels();
    const callback = handleCallback(req.body);

    if (callback.resultCode === 0) {
      await Transaction.create({
        tenantId: req.user?.id,
        type: 'mpesa',
        amount: callback.amount,
        description: `M-Pesa payment: ${callback.mpesaReceiptNumber}`,
        status: 'completed',
        mpesaReceipt: callback.mpesaReceiptNumber,
        mpesaPhone: callback.phoneNumber,
        date: new Date(),
      });

      if (req.user?.id) {
        const tenant = await Tenant.findById(req.user.id);
        if (tenant) {
          const appName = await getSiteName();
          sendTemplateEmail('cyber-payment-confirmed', {
            to: tenant.email,
            name: tenant.ownerName,
            amount: callback.amount,
            plan: tenant.plan,
            receipt: callback.mpesaReceiptNumber,
            validUntil: tenant.subscriptionEndDate?.toLocaleDateString() || 'N/A',
            appName,
            system: 'cyber',
          }).catch(err => console.error('Payment confirmed email failed:', err.message));
        }
      }
    } else {
      await Transaction.create({
        tenantId: req.user?.id,
        type: 'mpesa',
        amount: 0,
        description: `Failed: ${callback.resultDesc}`,
        status: 'failed',
        date: new Date(),
      });

      if (req.user?.id) {
        const tenant = await Tenant.findById(req.user.id);
        if (tenant) {
          const appName = await getSiteName();
          sendTemplateEmail('cyber-payment-failed', {
            to: tenant.email,
            name: tenant.ownerName,
            amount: callback.amount || 0,
            retryUrl: `${env.CYBER_URL}/billing`,
            appName,
            system: 'cyber',
          }).catch(err => console.error('Payment failed email failed:', err.message));
        }
      }
    }

    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { initiateStkPush, mpesaCallback };