// controllers/cyber/admin/tenantController.js

const { connectCyber } = require('../../../config/db');
const { sendTemplateEmail } = require('../../../services/emailService');
const { env } = require('../../../config/env');

let cyberConnection;
let Tenant, SiteSettings;

const getModels = async () => {
  if (!cyberConnection) cyberConnection = await connectCyber();
  if (!Tenant) {
    Tenant = cyberConnection.model('Tenant');
    SiteSettings = cyberConnection.model('SiteSettings');
  }
  return { Tenant, SiteSettings };
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

// @desc    Get all tenants
// @route   GET /api/cyber/admin/tenants
// @access  Private/SuperAdmin
const getAllTenants = async (req, res) => {
  try {
    const { Tenant } = await getModels();
    const tenants = await Tenant.find().sort({ createdAt: -1 });
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tenant by ID
// @route   GET /api/cyber/admin/tenants/:id
// @access  Private/SuperAdmin
const getTenantById = async (req, res) => {
  try {
    const { Tenant } = await getModels();
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// approveTenant

const approveTenant = async (req, res) => {
  try {
    const { Tenant } = await getModels();
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    tenant.status = 'active';
    tenant.subscriptionStartDate = new Date();
    tenant.subscriptionEndDate = new Date(Date.now() + (tenant.plan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000);
    await tenant.save();

    // Create transaction record for paid plans
    if (tenant.plan !== 'trial') {
      const Transaction = cyberConnection.model('Transaction');
      const planPrice = tenant.plan === 'yearly' ? 15000 : 1500;
      await Transaction.create({
        tenantId: tenant._id,
        type: 'subscription',
        amount: planPrice,
        description: `${tenant.plan} subscription - ${tenant.businessName}`,
        status: 'completed',
        date: new Date(),
      });
    }

    const appName = await getSiteName();
    sendTemplateEmail('cyber-account-approved', {
      to: tenant.email,
      name: tenant.ownerName,
      plan: tenant.plan,
      loginUrl: env.CYBER_URL,
      appName,
      system: 'cyber',
    }).catch(err => console.error('Approval email failed:', err.message));

    res.json({ success: true, message: 'Tenant approved', tenant: tenant.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject tenant
// @route   PUT /api/cyber/admin/tenants/:id/reject
// @access  Private/SuperAdmin
const rejectTenant = async (req, res) => {
  try {
    const { Tenant } = await getModels();
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    tenant.status = 'cancelled';
    await tenant.save();

    const appName = await getSiteName();
    sendTemplateEmail('cyber-account-rejected', {
      to: tenant.email,
      name: tenant.ownerName,
      appName,
      system: 'cyber',
    }).catch(err => console.error('Rejection email failed:', err.message));

    res.json({ success: true, message: 'Tenant rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Suspend tenant
// @route   PUT /api/cyber/admin/tenants/:id/suspend
// @access  Private/SuperAdmin
const suspendTenant = async (req, res) => {
  try {
    const { Tenant } = await getModels();
    const tenant = await Tenant.findByIdAndUpdate(req.params.id, { status: 'suspended' }, { new: true });
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    res.json({ success: true, message: 'Tenant suspended', tenant: tenant.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Activate tenant
// @route   PUT /api/cyber/admin/tenants/:id/activate
// @access  Private/SuperAdmin
const activateTenant = async (req, res) => {
  try {
    const { Tenant } = await getModels();
    const tenant = await Tenant.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true });
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    res.json({ success: true, message: 'Tenant activated', tenant: tenant.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete tenant
// @route   DELETE /api/cyber/admin/tenants/:id
// @access  Private/SuperAdmin
const deleteTenant = async (req, res) => {
  try {
    const { Tenant } = await getModels();
    const tenant = await Tenant.findByIdAndDelete(req.params.id);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    res.json({ message: 'Tenant deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tenant stats
// @route   GET /api/cyber/admin/tenants/stats
// @access  Private/SuperAdmin
const getTenantStats = async (req, res) => {
  try {
    const { Tenant } = await getModels();
    const total = await Tenant.countDocuments();
    const byStatus = await Tenant.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const byPlan = await Tenant.aggregate([{ $group: { _id: '$plan', count: { $sum: 1 } } }]);
    res.json({ total, byStatus, byPlan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllTenants, getTenantById, approveTenant, rejectTenant, suspendTenant, activateTenant, deleteTenant, getTenantStats };