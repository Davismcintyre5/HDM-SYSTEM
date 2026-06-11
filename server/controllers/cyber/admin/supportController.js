// controllers/cyber/admin/supportController.js

const { connectCyber } = require('../../../config/db');
const { sendTemplateEmail } = require('../../../services/emailService');
const { env } = require('../../../config/env');

let cyberConnection;
let SupportTicket, SiteSettings;

const getModels = async () => {
  if (!cyberConnection) cyberConnection = await connectCyber();
  if (!SupportTicket) {
    SupportTicket = cyberConnection.model('SupportTicket');
    SiteSettings = cyberConnection.model('SiteSettings');
  }
  return { SupportTicket, SiteSettings };
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

// @desc    Submit support ticket
// @route   POST /api/cyber/support
// @access  Public
const submitTicket = async (req, res) => {
  try {
    const { SupportTicket } = await getModels();
    const { name, email, subject, message, tenantId } = req.body;
    if (!name || !email || !subject || !message) return res.status(400).json({ message: 'All fields required' });
    const ticket = await SupportTicket.create({ name, email, subject, message, tenantId: tenantId || null });
    res.status(201).json({ success: true, message: 'Ticket submitted', ticketId: ticket._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tickets (admin)
// @route   GET /api/cyber/admin/support
// @access  Private/SuperAdmin
const getAllTickets = async (req, res) => {
  try {
    const { SupportTicket } = await getModels();
    const tickets = await SupportTicket.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get ticket by ID
// @route   GET /api/cyber/admin/support/:id
// @access  Private/SuperAdmin
const getTicketById = async (req, res) => {
  try {
    const { SupportTicket } = await getModels();
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reply to ticket
// @route   PUT /api/cyber/admin/support/:id/reply
// @access  Private/SuperAdmin
const replyToTicket = async (req, res) => {
  try {
    const { SupportTicket } = await getModels();
    const { reply } = req.body;
    if (!reply) return res.status(400).json({ message: 'Reply required' });
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    ticket.adminReply = reply;
    ticket.status = 'in_progress';
    ticket.repliedAt = new Date();
    await ticket.save();

    const appName = await getSiteName();
    sendTemplateEmail('cyber-support-reply', {
      to: ticket.email,
      name: ticket.name,
      ticketId: ticket._id,
      reply,
      appName,
      system: 'cyber',
    }).catch(err => console.error('Support reply email failed:', err.message));

    res.json({ success: true, message: 'Reply sent', ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update ticket status
// @route   PUT /api/cyber/admin/support/:id/status
// @access  Private/SuperAdmin
const updateTicketStatus = async (req, res) => {
  try {
    const { SupportTicket } = await getModels();
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: 'Status required' });
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    ticket.status = status;
    if (status === 'resolved') ticket.resolvedAt = new Date();
    await ticket.save();
    res.json({ success: true, message: 'Status updated', ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitTicket, getAllTickets, getTicketById, replyToTicket, updateTicketStatus };