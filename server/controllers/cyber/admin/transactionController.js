// controllers/cyber/admin/transactionController.js

const { connectCyber } = require('../../../config/db');

let cyberConnection;
let Transaction, Tenant;

const getModels = async () => {
  if (!cyberConnection) cyberConnection = await connectCyber();
  if (!Transaction) {
    Transaction = cyberConnection.model('Transaction');
    Tenant = cyberConnection.model('Tenant');
  }
  return { Transaction, Tenant };
};

// @desc    Get all transactions
// @route   GET /api/cyber/admin/transactions
// @access  Private/SuperAdmin
const getAllTransactions = async (req, res) => {
  try {
    const { Transaction } = await getModels();
    const transactions = await Transaction.find().sort({ date: -1 }).populate('tenantId', 'businessName email');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get transactions by tenant
// @route   GET /api/cyber/admin/transactions/tenant/:tenantId
// @access  Private/SuperAdmin
const getTransactionsByTenant = async (req, res) => {
  try {
    const { Transaction } = await getModels();
    const transactions = await Transaction.find({ tenantId: req.params.tenantId }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get revenue summary
// @route   GET /api/cyber/admin/transactions/summary
// @access  Private/SuperAdmin
const getRevenueSummary = async (req, res) => {
  try {
    const { Transaction } = await getModels();
    const transactions = await Transaction.find({ status: 'completed' });
    const totalRevenue = transactions.reduce((s, t) => s + t.amount, 0);
    const byMonth = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$date' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    res.json({ totalRevenue, totalTransactions: transactions.length, byMonth });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllTransactions, getTransactionsByTenant, getRevenueSummary };