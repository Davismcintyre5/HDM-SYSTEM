// controllers/cyber/tenant/invoiceController.js

const { connectCyber } = require('../../../config/db');
const { sendTemplateEmail } = require('../../../services/emailService');
const { env } = require('../../../config/env');

let cyberConnection;
let Invoice, Account, SiteSettings;

const getModels = async () => {
  if (!cyberConnection) cyberConnection = await connectCyber();
  if (!Invoice) {
    Invoice = cyberConnection.model('Invoice');
    Account = cyberConnection.model('Account');
    SiteSettings = cyberConnection.model('SiteSettings');
  }
  return { Invoice, Account, SiteSettings };
};

const getSiteName = async () => {
  try {
    const { SiteSettings } = await getModels();
    const settings = await SiteSettings.findOne();
    return settings?.siteName || env.APP_NAME_CYBER;
  } catch { return env.APP_NAME_CYBER; }
};

const generateInvoiceNumber = async () => {
  const count = await Invoice.countDocuments() + 1;
  return `INV-${String(count).padStart(5, '0')}`;
};

// @desc    Get all invoices
// @route   GET /api/cyber/tenant/invoices
// @access  Private/Tenant
const getAllInvoices = async (req, res) => {
  try {
    const { Invoice } = await getModels();
    const invoices = await Invoice.find({ tenantId: req.user.id }).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get invoice by ID
// @route   GET /api/cyber/tenant/invoices/:id
// @access  Private/Tenant
const getInvoiceById = async (req, res) => {
  try {
    const { Invoice } = await getModels();
    const invoice = await Invoice.findOne({ _id: req.params.id, tenantId: req.user.id });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create invoice
// @route   POST /api/cyber/tenant/invoices
// @access  Private/Tenant
const createInvoice = async (req, res) => {
  try {
    const { Invoice } = await getModels();
    const { customerName, customerEmail, customerPhone, items, total, amountPaid, paymentMethod, notes } = req.body;

    const invoiceNumber = await generateInvoiceNumber();
    const balance = total - (amountPaid || 0);
    const status = balance <= 0 ? 'paid' : 'draft';

    const invoice = await Invoice.create({
      tenantId: req.user.id,
      invoiceNumber,
      customerName,
      customerEmail,
      customerPhone,
      items,
      subtotal: total,
      total,
      amountPaid: amountPaid || 0,
      balance,
      status,
      paymentMethod: paymentMethod || 'cash',
      notes,
      date: new Date(),
    });

    // If fully paid, add to accounts immediately
    if (status === 'paid') {
      await Account.create({
        tenantId: req.user.id,
        type: 'in',
        amount: total,
        description: `Invoice ${invoiceNumber} — ${customerName}`,
        category: 'Sales',
        date: new Date(),
        reference: invoice._id.toString(),
      });
      invoice.paidAt = new Date();
      await invoice.save();
    }

    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Send invoice via email
// @route   POST /api/cyber/tenant/invoices/:id/send
// @access  Private/Tenant
const sendInvoice = async (req, res) => {
  try {
    const { Invoice } = await getModels();
    const invoice = await Invoice.findOne({ _id: req.params.id, tenantId: req.user.id });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    if (invoice.status === 'paid') return res.status(400).json({ message: 'Invoice already paid' });
    if (!invoice.customerEmail) return res.status(400).json({ message: 'Customer email required' });

    const appName = await getSiteName();
    const itemsHtml = invoice.items.map(i => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>KES ${i.price?.toLocaleString()}</td><td>KES ${(i.price * i.quantity).toLocaleString()}</td></tr>`).join('');

    await sendTemplateEmail('invoice-sent', {
      to: invoice.customerEmail,
      customerName: invoice.customerName,
      invoiceNumber: invoice.invoiceNumber,
      itemsHtml,
      total: invoice.total,
      balance: invoice.balance,
      appName,
      system: 'cyber',
    });

    invoice.status = 'sent';
    invoice.sentAt = new Date();
    await invoice.save();

    res.json({ success: true, message: 'Invoice sent', invoice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Pay invoice
// @route   PUT /api/cyber/tenant/invoices/:id/pay
// @access  Private/Tenant
const payInvoice = async (req, res) => {
  try {
    const { Invoice, Account } = await getModels();
    const invoice = await Invoice.findOne({ _id: req.params.id, tenantId: req.user.id });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    if (invoice.status === 'paid') return res.status(400).json({ message: 'Invoice already paid' });

    const { amount } = req.body;
    const paid = invoice.amountPaid + (amount || invoice.balance);

    invoice.amountPaid = paid;
    invoice.balance = invoice.total - paid;

    if (invoice.balance <= 0) {
      invoice.status = 'paid';
      invoice.paidAt = new Date();

      // Add to accounts when fully paid
      await Account.create({
        tenantId: req.user.id,
        type: 'in',
        amount: invoice.total,
        description: `Invoice ${invoice.invoiceNumber} — ${invoice.customerName}`,
        category: 'Sales',
        date: new Date(),
        reference: invoice._id.toString(),
      });
    }

    await invoice.save();
    res.json({ success: true, message: 'Payment recorded', invoice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete invoice
// @route   DELETE /api/cyber/tenant/invoices/:id
// @access  Private/Tenant
const deleteInvoice = async (req, res) => {
  try {
    const { Invoice, Account } = await getModels();
    const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, tenantId: req.user.id });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    await Account.deleteOne({ reference: invoice._id.toString(), tenantId: req.user.id });
    res.json({ message: 'Invoice deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllInvoices, getInvoiceById, createInvoice, sendInvoice, payInvoice, deleteInvoice };