// controllers/school/transactionController.js

const { connectSchool } = require('../../config/db');

let schoolConnection;
let Transaction;

const getModels = async () => {
  if (!schoolConnection) schoolConnection = await connectSchool();
  if (!Transaction) Transaction = schoolConnection.model('Transaction');
  return { Transaction };
};

// @desc    Get balance and all transactions
// @route   GET /api/school/accounts
// @access  Private/Admin
const getBalance = async (req, res) => {
  try {
    const { Transaction } = await getModels();
    const transactions = await Transaction.find().sort({ date: -1 });
    const totalIn = transactions.filter(t => t.type === 'in').reduce((s, t) => s + t.amount, 0);
    const totalOut = transactions.filter(t => t.type === 'out').reduce((s, t) => s + t.amount, 0);
    res.json({ balance: totalIn - totalOut, totalIn, totalOut, transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get transactions
// @route   GET /api/school/accounts/transactions
// @access  Private/Admin
const getTransactions = async (req, res) => {
  try {
    const { Transaction } = await getModels();
    const transactions = await Transaction.find().sort({ date: -1 }).limit(100);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add income
// @route   POST /api/school/accounts/income
// @access  Private/Admin
const addIncome = async (req, res) => {
  try {
    const { Transaction } = await getModels();
    const { amount, description } = req.body;
    if (!amount || amount <= 0 || !description?.trim()) return res.status(400).json({ message: 'Valid amount and description required' });
    const transaction = await Transaction.create({ type: 'in', amount: parseFloat(amount), description: description.trim(), date: new Date() });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add expense
// @route   POST /api/school/accounts/expense
// @access  Private/Admin
const addExpense = async (req, res) => {
  try {
    const { Transaction } = await getModels();
    const { amount, description } = req.body;
    if (!amount || amount <= 0 || !description?.trim()) return res.status(400).json({ message: 'Valid amount and description required' });
    const transaction = await Transaction.create({ type: 'out', amount: parseFloat(amount), description: description.trim(), date: new Date() });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get summary
// @route   GET /api/school/accounts/summary
// @access  Private/Admin
const getSummary = async (req, res) => {
  try {
    const { Transaction } = await getModels();
    const transactions = await Transaction.find();
    const totalIn = transactions.filter(t => t.type === 'in').reduce((s, t) => s + t.amount, 0);
    const totalOut = transactions.filter(t => t.type === 'out').reduce((s, t) => s + t.amount, 0);
    res.json({ balance: totalIn - totalOut, totalIncome: totalIn, totalExpense: totalOut, transactionCount: transactions.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBalance, getTransactions, addIncome, addExpense, getSummary };