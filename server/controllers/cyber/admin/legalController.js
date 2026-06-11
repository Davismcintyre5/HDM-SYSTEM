// controllers/cyber/admin/legalController.js

const { connectCyber } = require('../../../config/db');

let cyberConnection;
let Legal;

const getModels = async () => {
  if (!cyberConnection) cyberConnection = await connectCyber();
  if (!Legal) Legal = cyberConnection.model('Legal');
  return { Legal };
};

// @desc    Get all legal pages (public)
// @route   GET /api/cyber/legal
// @access  Public
const getLegalPages = async (req, res) => {
  try {
    const { Legal } = await getModels();
    const pages = await Legal.findOne();
    res.json(pages || { terms: '', privacy: '', refund: '' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get specific legal page (public)
// @route   GET /api/cyber/legal/:page
// @access  Public
const getLegalPage = async (req, res) => {
  try {
    const { Legal } = await getModels();
    const { page } = req.params;
    if (!['terms', 'privacy', 'refund'].includes(page)) return res.status(400).json({ message: 'Invalid page' });
    const pages = await Legal.findOne();
    res.json({ page, content: pages?.[page] || '' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get legal pages (admin)
// @route   GET /api/cyber/admin/legal
// @access  Private/SuperAdmin
const getLegalPagesAdmin = async (req, res) => {
  try {
    const { Legal } = await getModels();
    let pages = await Legal.findOne();
    if (!pages) pages = await Legal.create({ terms: '', privacy: '', refund: '' });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update legal pages
// @route   PUT /api/cyber/admin/legal
// @access  Private/SuperAdmin
const updateLegalPages = async (req, res) => {
  try {
    const { Legal } = await getModels();
    const pages = await Legal.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json({ success: true, message: 'Legal pages updated', pages });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getLegalPages, getLegalPage, getLegalPagesAdmin, updateLegalPages };