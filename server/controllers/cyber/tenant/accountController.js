const { connectCyber } = require('../../../config/db');

let cyberConnection;
let Account;

const getModels = async () => {
  if (!cyberConnection) cyberConnection = await connectCyber();
  if (!Account) Account = cyberConnection.model('Account');
  return { Account };
};

// @desc    Get all accounts
// @route   GET /api/cyber/tenant/accounts
// @access  Private/Tenant
const getAllAccounts = async (req, res) => {
  try {
    const { Account } = await getModels();
    const accounts = await Account.find({ tenantId: req.user.id }).sort({ date: -1 });
    const totalIn = accounts.filter(a => a.type === 'in').reduce((s, a) => s + a.amount, 0);
    const totalOut = accounts.filter(a => a.type === 'out').reduce((s, a) => s + a.amount, 0);
    res.json({ balance: totalIn - totalOut, totalIn, totalOut, accounts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get account by ID
// @route   GET /api/cyber/tenant/accounts/:id
// @access  Private/Tenant
const getAccountById = async (req, res) => {
  try {
    const { Account } = await getModels();
    const account = await Account.findOne({ _id: req.params.id, tenantId: req.user.id });
    if (!account) return res.status(404).json({ message: 'Record not found' });
    res.json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add income
// @route   POST /api/cyber/tenant/accounts/income
// @access  Private/Tenant
const addIncome = async (req, res) => {
  try {
    const { Account } = await getModels();
    const { amount, description, category } = req.body;
    if (!amount || amount <= 0 || !description?.trim()) return res.status(400).json({ message: 'Valid amount and description required' });
    const account = await Account.create({ tenantId: req.user.id, type: 'in', amount: parseFloat(amount), description: description.trim(), category, date: new Date() });
    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add expense
// @route   POST /api/cyber/tenant/accounts/expense
// @access  Private/Tenant
const addExpense = async (req, res) => {
  try {
    const { Account } = await getModels();
    const { amount, description, category } = req.body;
    if (!amount || amount <= 0 || !description?.trim()) return res.status(400).json({ message: 'Valid amount and description required' });
    const account = await Account.create({ tenantId: req.user.id, type: 'out', amount: parseFloat(amount), description: description.trim(), category, date: new Date() });
    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete account record
// @route   DELETE /api/cyber/tenant/accounts/:id
// @access  Private/Tenant
const deleteAccount = async (req, res) => {
  try {
    const { Account } = await getModels();
    const account = await Account.findOneAndDelete({ _id: req.params.id, tenantId: req.user.id });
    if (!account) return res.status(404).json({ message: 'Record not found' });
    res.json({ message: 'Record deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get summary
// @route   GET /api/cyber/tenant/accounts/summary
// @access  Private/Tenant
const getSummary = async (req, res) => {
  try {
    const { Account } = await getModels();
    const accounts = await Account.find({ tenantId: req.user.id });
    const totalIn = accounts.filter(a => a.type === 'in').reduce((s, a) => s + a.amount, 0);
    const totalOut = accounts.filter(a => a.type === 'out').reduce((s, a) => s + a.amount, 0);
    res.json({ balance: totalIn - totalOut, totalIncome: totalIn, totalExpense: totalOut, totalRecords: accounts.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllAccounts, getAccountById, addIncome, addExpense, deleteAccount, getSummary };