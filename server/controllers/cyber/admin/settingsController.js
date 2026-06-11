// controllers/cyber/admin/settingsController.js

const { connectCyber } = require('../../../config/db');

let cyberConnection;
let SiteSettings;

const getModels = async () => {
  if (!cyberConnection) cyberConnection = await connectCyber();
  if (!SiteSettings) SiteSettings = cyberConnection.model('SiteSettings');
  return { SiteSettings };
};

// @desc    Get site settings
// @route   GET /api/cyber/admin/settings
// @access  Private/SuperAdmin
const getSettings = async (req, res) => {
  try {
    const { SiteSettings } = await getModels();
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({
        siteName: 'HDM Cyber',
        paymentMethods: { stkPush: true, sendMoney: false, till: false, paybill: false },
        mpesaDetails: { tillNumber: '', paybillNumber: '', sendMoneyNumber: '' },
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update site settings
// @route   PUT /api/cyber/admin/settings
// @access  Private/SuperAdmin
const updateSettings = async (req, res) => {
  try {
    const { SiteSettings } = await getModels();
    const settings = await SiteSettings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json({ success: true, message: 'Settings saved', settings });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get public payment settings
// @route   GET /api/cyber/public-settings
// @access  Public
const getPublicSettings = async (req, res) => {
  try {
    const { SiteSettings } = await getModels();
    const settings = await SiteSettings.findOne();
    res.json({
      siteName: settings?.siteName || 'HDM Cyber',
      contactEmail: settings?.contactEmail || '',
      contactPhone: settings?.contactPhone || '',
      address: settings?.address || '',
      paymentMethods: settings?.paymentMethods || { stkPush: true, sendMoney: false, till: false, paybill: false },
      mpesaDetails: settings?.mpesaDetails || { tillNumber: '', paybillNumber: '', sendMoneyNumber: '' },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSettings, updateSettings, getPublicSettings };