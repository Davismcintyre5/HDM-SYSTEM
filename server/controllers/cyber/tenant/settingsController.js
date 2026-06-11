const { connectCyber } = require('../../../config/db');

let cyberConnection;
let Setting;

const getModels = async () => {
  if (!cyberConnection) cyberConnection = await connectCyber();
  if (!Setting) Setting = cyberConnection.model('Setting');
  return { Setting };
};

// @desc    Get settings
// @route   GET /api/cyber/tenant/settings
// @access  Private/Tenant
const getSettings = async (req, res) => {
  try {
    const { Setting } = await getModels();
    let settings = await Setting.findOne({ tenantId: req.user.id });
    if (!settings) settings = await Setting.create({ tenantId: req.user.id });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update settings
// @route   PUT /api/cyber/tenant/settings
// @access  Private/Tenant
const updateSettings = async (req, res) => {
  try {
    const { Setting } = await getModels();
    const settings = await Setting.findOneAndUpdate({ tenantId: req.user.id }, req.body, { new: true, upsert: true });
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getSettings, updateSettings };