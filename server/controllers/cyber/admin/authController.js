// controllers/cyber/admin/authController.js

const jwt = require('jsonwebtoken');
const { connectCyber } = require('../../../config/db');
const { env } = require('../../../config/env');
const { generateTokens } = require('../../../middleware/auth');

let cyberConnection;
let SuperAdmin;

const getModels = async () => {
  if (!cyberConnection) cyberConnection = await connectCyber();
  if (!SuperAdmin) SuperAdmin = cyberConnection.model('SuperAdmin');
  return { SuperAdmin };
};

// @desc    Super admin login
// @route   POST /api/cyber/admin/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { SuperAdmin } = await getModels();
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const admin = await SuperAdmin.findOne({ email, active: true });
    if (!admin || !(await admin.comparePassword(password))) return res.status(401).json({ message: 'Invalid credentials' });
    admin.lastLogin = new Date();
    await admin.save();
    const payload = { id: admin._id, email: admin.email, role: 'super_admin', system: 'cyber_admin' };
    const tokens = generateTokens(payload, env.CYBER_ADMIN_SECRET, env.CYBER_ADMIN_REFRESH_SECRET, env.CYBER_ADMIN_EXPIRE, env.CYBER_ADMIN_REFRESH_EXPIRE);
    res.json({ success: true, ...tokens, admin: admin.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Refresh token
// @route   POST /api/cyber/admin/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(400).json({ message: 'Refresh token required' });
    const decoded = jwt.verify(token, env.CYBER_ADMIN_REFRESH_SECRET);
    const payload = { id: decoded.id, email: decoded.email, role: 'super_admin', system: 'cyber_admin' };
    const tokens = generateTokens(payload, env.CYBER_ADMIN_SECRET, env.CYBER_ADMIN_REFRESH_SECRET, env.CYBER_ADMIN_EXPIRE, env.CYBER_ADMIN_REFRESH_EXPIRE);
    res.json({ success: true, ...tokens });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// @desc    Change password
// @route   PUT /api/cyber/admin/auth/change-password
// @access  Private/SuperAdmin
const changePassword = async (req, res) => {
  try {
    const { SuperAdmin } = await getModels();
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ message: 'Both passwords required' });
    const admin = await SuperAdmin.findById(req.user.id);
    if (!admin || !(await admin.comparePassword(oldPassword))) return res.status(401).json({ message: 'Old password incorrect' });
    admin.password = newPassword;
    await admin.save();
    res.json({ success: true, message: 'Password changed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify admin access hash and optionally login
// @route   POST /api/cyber/admin/verify-access
// @access  Public
const verifyAccess = async (req, res) => {
  try {
    const { hash, email, password } = req.body;
    if (!hash) return res.status(400).json({ message: 'Access key required' });

    if (hash !== env.ADMIN_ACCESS_HASH) {
      return res.status(403).json({ message: 'Invalid access key' });
    }

    if (!email || !password) {
      return res.json({ success: true, message: 'Hash verified' });
    }

    const { SuperAdmin } = await getModels();
    const admin = await SuperAdmin.findOne({ email, active: true });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    admin.lastLogin = new Date();
    await admin.save();
    const payload = { id: admin._id, email: admin.email, role: 'super_admin', system: 'cyber_admin' };
    const tokens = generateTokens(payload, env.CYBER_ADMIN_SECRET, env.CYBER_ADMIN_REFRESH_SECRET, env.CYBER_ADMIN_EXPIRE, env.CYBER_ADMIN_REFRESH_EXPIRE);
    res.json({ success: true, ...tokens, admin: admin.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { login, refreshToken, changePassword, verifyAccess };