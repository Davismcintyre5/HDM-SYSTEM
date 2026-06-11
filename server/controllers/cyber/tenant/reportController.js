const { connectCyber } = require('../../../config/db');
const mongoose = require('mongoose');

let cyberConnection;
let Service, Account, Inventory, Transaction;

const getModels = async () => {
  if (!cyberConnection) cyberConnection = await connectCyber();
  if (!Service) {
    Service = cyberConnection.model('Service');
    Account = cyberConnection.model('Account');
    Inventory = cyberConnection.model('Inventory');
    Transaction = cyberConnection.model('Transaction');
  }
  return { Service, Account, Inventory, Transaction };
};

// @desc    Get dashboard stats
// @route   GET /api/cyber/tenant/reports/dashboard
// @access  Private/Tenant
const getDashboardStats = async (req, res) => {
  try {
    const { Service, Account, Inventory, Transaction } = await getModels();
    const tenantId = req.user.id;
    const [services, accounts, inventory, transactions] = await Promise.all([
      Service.countDocuments({ tenantId }),
      Account.find({ tenantId }),
      Inventory.find({ tenantId }),
      Transaction.find({ tenantId }).sort({ date: -1 }).limit(10),
    ]);
    const totalIncome = accounts.filter(a => a.type === 'in').reduce((s, a) => s + a.amount, 0);
    const totalExpense = accounts.filter(a => a.type === 'out').reduce((s, a) => s + a.amount, 0);
    const inventoryValue = inventory.reduce((s, i) => s + (i.value || 0) * (i.quantity || 1), 0);
    res.json({ services, totalIncome, totalExpense, balance: totalIncome - totalExpense, inventoryItems: inventory.length, inventoryValue, recentTransactions: transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get financial reports
// @route   GET /api/cyber/tenant/reports/financial
// @access  Private/Tenant
const getFinancialReports = async (req, res) => {
  try {
    const { Account } = await getModels();
    const accounts = await Account.find({ tenantId: req.user.id }).sort({ date: -1 });
    const totalIn = accounts.filter(a => a.type === 'in').reduce((s, a) => s + a.amount, 0);
    const totalOut = accounts.filter(a => a.type === 'out').reduce((s, a) => s + a.amount, 0);

    const byMonth = await Account.aggregate([
      { $match: { tenantId: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$date' } }, in: { $sum: { $cond: [{ $eq: ['$type', 'in'] }, '$amount', 0] } }, out: { $sum: { $cond: [{ $eq: ['$type', 'out'] }, '$amount', 0] } } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({ totalIncome: totalIn, totalExpense: totalOut, balance: totalIn - totalOut, byMonth });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats, getFinancialReports };