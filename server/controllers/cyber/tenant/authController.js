// controllers/cyber/tenant/authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectCyber } = require('../../../config/db');
const { env } = require('../../../config/env');
const { generateTokens } = require('../../../middleware/auth');

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

// controllers/cyber/tenant/authController.js — update register and registerPaid

// @desc    Register tenant (trial)
// @route   POST /api/cyber/tenant/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { Tenant } = await getModels();
    const { businessName, ownerName, email, password, phone, address } = req.body;
    if (!businessName || !ownerName || !email || !password) return res.status(400).json({ message: 'All fields required' });

    const existing = await Tenant.findOne({ email });
    if (existing) {
      if (existing.status === 'cancelled') {
        await Tenant.findByIdAndDelete(existing._id);
      } else {
        return res.status(400).json({ message: 'Email already registered' });
      }
    }

    const trialEndDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const tenant = new Tenant({
      businessName, ownerName, email, password, phone, address,
      plan: 'trial', status: 'active',
      trialStartDate: new Date(),
      trialEndDate,
    });
    await tenant.save();

    const payload = { id: tenant._id, email: tenant.email, plan: tenant.plan, system: 'cyber_tenant' };
    const tokens = generateTokens(payload, env.CYBER_JWT_SECRET, env.CYBER_JWT_REFRESH_SECRET, env.CYBER_JWT_EXPIRE, env.CYBER_JWT_REFRESH_EXPIRE);

    const appName = await getSiteName();
    const { sendTemplateEmail } = require('../../../services/emailService');
    sendTemplateEmail('cyber-trial-welcome', {
      to: tenant.email,
      name: tenant.ownerName,
      trialDays: 14,
      trialEndDate: trialEndDate.toLocaleDateString(),
      loginUrl: env.CYBER_URL,
      appName,
      system: 'cyber',
    }).catch(err => console.error('Welcome email failed:', err.message));

    res.status(201).json({ success: true, message: 'Trial started', ...tokens, tenant: tenant.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register tenant (paid)
// @route   POST /api/cyber/tenant/auth/register-paid
// @access  Public
const registerPaid = async (req, res) => {
  try {
    const { Tenant } = await getModels();
    const { businessName, ownerName, email, password, phone, address, plan } = req.body;
    if (!businessName || !ownerName || !email || !password || !plan) return res.status(400).json({ message: 'All fields required' });

    const existing = await Tenant.findOne({ email });
    if (existing) {
      if (existing.status === 'cancelled') {
        await Tenant.findByIdAndDelete(existing._id);
      } else {
        return res.status(400).json({ message: 'Email already registered' });
      }
    }

    const tenant = new Tenant({ businessName, ownerName, email, password, phone, address, plan, status: 'pending' });
    await tenant.save();

    const appName = await getSiteName();
    const { sendTemplateEmail } = require('../../../services/emailService');
    sendTemplateEmail('cyber-registration-pending', {
      to: tenant.email,
      name: tenant.ownerName,
      plan: tenant.plan,
      appName,
      system: 'cyber',
    }).catch(err => console.error('Registration pending email failed:', err.message));

    res.status(201).json({ success: true, message: 'Registration submitted for approval' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login tenant
// @route   POST /api/cyber/tenant/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { Tenant } = await getModels();
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const tenant = await Tenant.findOne({ email, active: true });
    if (!tenant || !(await tenant.comparePassword(password))) return res.status(401).json({ message: 'Invalid credentials' });

    if (tenant.status === 'pending') return res.status(403).json({ message: 'Account pending approval' });
    if (tenant.status === 'expired') return res.status(403).json({ message: 'Subscription expired. Please renew.' });
    if (tenant.status === 'suspended') return res.status(403).json({ message: 'Account suspended. Contact support.' });

    tenant.lastLogin = new Date();
    await tenant.save();

    const payload = { id: tenant._id, email: tenant.email, plan: tenant.plan, system: 'cyber_tenant' };
    const tokens = generateTokens(payload, env.CYBER_JWT_SECRET, env.CYBER_JWT_REFRESH_SECRET, env.CYBER_JWT_EXPIRE, env.CYBER_JWT_REFRESH_EXPIRE);

    res.json({ success: true, ...tokens, tenant: tenant.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Refresh token
// @route   POST /api/cyber/tenant/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(400).json({ message: 'Refresh token required' });
    const decoded = jwt.verify(token, env.CYBER_JWT_REFRESH_SECRET);
    const payload = { id: decoded.id, email: decoded.email, plan: decoded.plan, system: 'cyber_tenant' };
    const tokens = generateTokens(payload, env.CYBER_JWT_SECRET, env.CYBER_JWT_REFRESH_SECRET, env.CYBER_JWT_EXPIRE, env.CYBER_JWT_REFRESH_EXPIRE);
    res.json({ success: true, ...tokens });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// @desc    Get profile
// @route   GET /api/cyber/tenant/auth/profile
// @access  Private/Tenant
const getProfile = async (req, res) => {
  try {
    const { Tenant } = await getModels();
    const tenant = await Tenant.findById(req.user.id);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    res.json(tenant.toJSON());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update profile
// @route   PUT /api/cyber/tenant/auth/profile
// @access  Private/Tenant
const updateProfile = async (req, res) => {
  try {
    const { Tenant } = await getModels();
    const { businessName, ownerName, phone, address } = req.body;
    const tenant = await Tenant.findById(req.user.id);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    if (businessName) tenant.businessName = businessName;
    if (ownerName) tenant.ownerName = ownerName;
    if (phone) tenant.phone = phone;
    if (address) tenant.address = address;
    await tenant.save();
    res.json({ success: true, message: 'Profile updated', tenant: tenant.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/cyber/tenant/auth/change-password
// @access  Private/Tenant
const changePassword = async (req, res) => {
  try {
    const { Tenant } = await getModels();
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Both passwords required' });
    const tenant = await Tenant.findById(req.user.id);
    if (!tenant || !(await tenant.comparePassword(currentPassword))) return res.status(401).json({ message: 'Current password incorrect' });
    tenant.password = newPassword;
    await tenant.save();
    res.json({ success: true, message: 'Password changed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, registerPaid, login, refreshToken, getProfile, updateProfile, changePassword };