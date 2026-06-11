// controllers/cyber/tenant/transactionController.js

const { connectCyber } = require('../../../config/db');

let cyberConnection;
let Transaction, Account;

const getModels = async () => {
  if (!cyberConnection) cyberConnection = await connectCyber();
  if (!Transaction) {
    Transaction = cyberConnection.model('Transaction');
    Account = cyberConnection.model('Account');
  }
  return { Transaction, Account };
};

// @desc    Get all transactions
// @route   GET /api/cyber/tenant/transactions
// @access  Private/Tenant
const getAllTransactions = async (req, res) => {
  try {
    const { Transaction } = await getModels();
    const transactions = await Transaction.find({ tenantId: req.user.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get transaction by ID
// @route   GET /api/cyber/tenant/transactions/:id
// @access  Private/Tenant
const getTransactionById = async (req, res) => {
  try {
    const { Transaction } = await getModels();
    const transaction = await Transaction.findOne({ _id: req.params.id, tenantId: req.user.id });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get transaction summary
// @route   GET /api/cyber/tenant/transactions/summary
// @access  Private/Tenant
const getTransactionSummary = async (req, res) => {
  try {
    const { Transaction } = await getModels();
    const transactions = await Transaction.find({ tenantId: req.user.id });
    const totalSubscription = transactions.filter(t => t.type === 'subscription').reduce((s, t) => s + t.amount, 0);
    const totalMpesa = transactions.filter(t => t.type === 'mpesa').reduce((s, t) => s + t.amount, 0);
    const totalOther = transactions.filter(t => t.type === 'other').reduce((s, t) => s + t.amount, 0);
    res.json({ totalSubscription, totalMpesa, totalOther, totalTransactions: transactions.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create transaction
// @route   POST /api/cyber/tenant/transactions
// @access  Private/Tenant
const createTransaction = async (req, res) => {
  try {
    const { Transaction, Account } = await getModels();
    const { type, amount, description, status, reference } = req.body;
    if (!amount || !description) return res.status(400).json({ message: 'Amount and description required' });

    const transaction = await Transaction.create({
      tenantId: req.user.id,
      type: type || 'other',
      amount: parseFloat(amount),
      description,
      status: status || 'completed',
      reference: reference || undefined,
      date: new Date(),
    });

    // Only add to accounts if completed (not pending or failed)
    if (status === 'completed') {
      await Account.create({
        tenantId: req.user.id,
        type: 'in',
        amount: parseFloat(amount),
        description: `Sale: ${description}`,
        category: 'Sales',
        date: new Date(),
        reference: transaction._id.toString(),
      });
    }

    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Confirm pending transaction
// @route   PUT /api/cyber/tenant/transactions/:id/confirm
// @access  Private/Tenant
const confirmTransaction = async (req, res) => {
  try {
    const { Transaction, Account } = await getModels();
    const transaction = await Transaction.findOne({ _id: req.params.id, tenantId: req.user.id });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (transaction.status !== 'pending') return res.status(400).json({ message: 'Transaction is not pending' });

    transaction.status = 'completed';
    await transaction.save();

    // Add to accounts on confirm
    await Account.create({
      tenantId: req.user.id,
      type: 'in',
      amount: transaction.amount,
      description: `Sale: ${transaction.description}`,
      category: 'Sales',
      date: new Date(),
      reference: transaction._id.toString(),
    });

    res.json({ success: true, message: 'Transaction confirmed', transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/cyber/tenant/transactions/:id
// @access  Private/Tenant
const deleteTransaction = async (req, res) => {
  try {
    const { Transaction, Account } = await getModels();
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, tenantId: req.user.id });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    // Also delete linked account entry
    await Account.deleteOne({ reference: transaction._id.toString(), tenantId: req.user.id });

    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllTransactions, getTransactionById, getTransactionSummary, createTransaction, confirmTransaction, deleteTransaction };