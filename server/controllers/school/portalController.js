// controllers/school/portalController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectSchool } = require('../../config/db');
const { env } = require('../../config/env');
const { generateTokens } = require('../../middleware/auth');

let schoolConnection;
let PortalUser, Student, Employee, Settings, Fee;

const getModels = async () => {
  if (!schoolConnection) schoolConnection = await connectSchool();
  if (!PortalUser) {
    PortalUser = schoolConnection.model('PortalUser');
    Student = schoolConnection.model('Student');
    Employee = schoolConnection.model('Employee');
    Settings = schoolConnection.model('Settings');
    Fee = schoolConnection.model('Fee');
  }
  return { PortalUser, Student, Employee, Settings, Fee };
};

// @desc    Register portal user
// @route   POST /api/school/portal/register
// @access  Public
const register = async (req, res) => {
  try {
    const { PortalUser, Student, Employee, Settings } = await getModels();
    const { regNumber, name, email, password } = req.body;
    if (!regNumber || !name || !email || !password) return res.status(400).json({ message: 'All fields are required' });

    let userDoc = await Student.findOne({ regNumber });
    let role = 'student';
    if (!userDoc) {
      userDoc = await Employee.findOne({ empId: regNumber });
      role = 'staff';
    }
    if (!userDoc) return res.status(400).json({ message: 'Registration number not found. Contact admin.' });

    if (await PortalUser.findOne({ email })) return res.status(400).json({ message: 'Email already registered' });
    if (await PortalUser.findOne({ regNumber })) return res.status(400).json({ message: 'Registration number already registered' });

    const portalUser = new PortalUser({ regNumber, name, email, password, role, userId: userDoc._id });
    await portalUser.save();

    const settings = await Settings.findOne();
    const { sendTemplateEmail } = require('../../services/emailService');
    sendTemplateEmail('school-portal-welcome', {
      to: portalUser.email,
      name: portalUser.name,
      regNumber: portalUser.regNumber,
      portalUrl: `${env.SCHOOL_URL}/portal`,
      schoolName: settings?.schoolName || env.APP_NAME_SCHOOL,
      system: 'school',
    }).catch(err => console.error('Portal welcome email failed:', err.message));

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: { id: portalUser._id, name: portalUser.name, email: portalUser.email, role: portalUser.role, regNumber: portalUser.regNumber },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login portal user
// @route   POST /api/school/portal/login
// @access  Public
const login = async (req, res) => {
  try {
    const { PortalUser } = await getModels();
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await PortalUser.findOne({ email, active: true });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Invalid credentials' });

    user.lastLogin = new Date();
    await user.save();

    const payload = { id: user._id, regNumber: user.regNumber, role: user.role, system: 'school_portal' };
    const tokens = generateTokens(payload, env.SCHOOL_PORTAL_SECRET, env.SCHOOL_PORTAL_REFRESH_SECRET, env.SCHOOL_PORTAL_EXPIRE, env.SCHOOL_PORTAL_REFRESH_EXPIRE);

    res.json({
      success: true,
      ...tokens,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, regNumber: user.regNumber },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Refresh portal token
// @route   POST /api/school/portal/refresh
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(400).json({ message: 'Refresh token required' });
    const decoded = jwt.verify(token, env.SCHOOL_PORTAL_REFRESH_SECRET);
    const payload = { id: decoded.id, regNumber: decoded.regNumber, role: decoded.role, system: 'school_portal' };
    const tokens = generateTokens(payload, env.SCHOOL_PORTAL_SECRET, env.SCHOOL_PORTAL_REFRESH_SECRET, env.SCHOOL_PORTAL_EXPIRE, env.SCHOOL_PORTAL_REFRESH_EXPIRE);
    res.json({ success: true, ...tokens });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// @desc    Get profile
// @route   GET /api/school/portal/profile
// @access  Private/Portal
const getProfile = async (req, res) => {
  try {
    const { PortalUser, Student, Employee, Settings, Fee } = await getModels();
    const portalUser = await PortalUser.findById(req.user.id);
    if (!portalUser) return res.status(404).json({ message: 'User not found' });

    let userData;
    let feeSummary = null;

    if (portalUser.role === 'student') {
      userData = await Student.findById(portalUser.userId);
      if (!userData) return res.status(404).json({ message: 'Student record not found' });

      const settings = await Settings.findOne();
      let courseFee = 0;
      if (settings?.courses && userData.course) {
        const course = settings.courses.find(c => c.name === userData.course);
        courseFee = course?.totalFee || 0;
      }
      const payments = await Fee.find({ regNumber: userData.regNumber }).sort({ date: -1 });
      const totalPaid = userData.feesPaid || 0;
      feeSummary = { totalFee: courseFee, totalPaid, balance: courseFee - totalPaid, payments };
    } else {
      userData = await Employee.findById(portalUser.userId);
    }

    const settings = await Settings.findOne();
    res.json({
      portalUser: { id: portalUser._id, name: portalUser.name, email: portalUser.email, role: portalUser.role, regNumber: portalUser.regNumber },
      userData,
      feeSummary,
      settings: settings ? { schoolName: settings.schoolName, address: settings.address, phone: settings.phone, email: settings.email, courses: settings.courses } : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update profile
// @route   PUT /api/school/portal/profile
// @access  Private/Portal
const updateProfile = async (req, res) => {
  try {
    const { PortalUser } = await getModels();
    const { name, email } = req.body;
    const user = await PortalUser.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (email && email !== user.email) {
      if (await PortalUser.findOne({ email })) return res.status(400).json({ message: 'Email already in use' });
      user.email = email;
    }
    if (name) user.name = name;
    user.updatedAt = new Date();
    await user.save();
    res.json({ success: true, message: 'Profile updated', user: { id: user._id, name: user.name, email: user.email, role: user.role, regNumber: user.regNumber } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change portal password
// @route   PUT /api/school/portal/change-password
// @access  Private/Portal
const changePassword = async (req, res) => {
  try {
    const { PortalUser } = await getModels();
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Both passwords required' });
    if (newPassword.length < 4) return res.status(400).json({ message: 'Password must be at least 4 characters' });
    const user = await PortalUser.findById(req.user.id);
    if (!user || !(await bcrypt.compare(currentPassword, user.password))) return res.status(401).json({ message: 'Current password incorrect' });
    user.password = newPassword;
    user.updatedAt = new Date();
    await user.save();
    res.json({ success: true, message: 'Password changed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Deactivate account
// @route   PUT /api/school/portal/deactivate
// @access  Private/Portal
const deactivateAccount = async (req, res) => {
  try {
    const { PortalUser } = await getModels();
    const user = await PortalUser.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.active = false;
    await user.save();
    res.json({ success: true, message: 'Account deactivated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all portal users (admin)
// @route   GET /api/school/portal/users
// @access  Private/Admin
const getAllPortalUsers = async (req, res) => {
  try {
    const { PortalUser, Student, Employee } = await getModels();
    const users = await PortalUser.find().sort({ createdAt: -1 });
    const enriched = await Promise.all(users.map(async (u) => {
      let extra = {};
      if (u.role === 'student') {
        const s = await Student.findById(u.userId);
        if (s) extra = { course: s.course, phone: s.phone, feesPaid: s.feesPaid };
      } else {
        const e = await Employee.findById(u.userId);
        if (e) extra = { duty: e.duty, empId: e.empId, phone: e.phone, salary: e.salary };
      }
      return { ...u.toObject(), password: undefined, ...extra };
    }));
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get portal user by ID (admin)
// @route   GET /api/school/portal/users/:id
// @access  Private/Admin
const getPortalUserById = async (req, res) => {
  try {
    const { PortalUser, Student, Employee } = await getModels();
    const user = await PortalUser.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    let extra = {};
    if (user.role === 'student') {
      const s = await Student.findById(user.userId);
      if (s) extra = { course: s.course, phone: s.phone, feesPaid: s.feesPaid, computerAssigned: s.computerAssigned };
    } else {
      const e = await Employee.findById(user.userId);
      if (e) extra = { duty: e.duty, empId: e.empId, phone: e.phone, salary: e.salary };
    }
    res.json({ ...user.toObject(), password: undefined, ...extra });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update portal user (admin)
// @route   PUT /api/school/portal/users/:id
// @access  Private/Admin
const updatePortalUser = async (req, res) => {
  try {
    const { PortalUser } = await getModels();
    const { name, email, role, active } = req.body;
    const user = await PortalUser.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (active !== undefined) user.active = active;
    user.updatedAt = new Date();
    await user.save();
    res.json({ success: true, message: 'User updated', user: { id: user._id, name: user.name, email: user.email, role: user.role, regNumber: user.regNumber, active: user.active } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete portal user (admin)
// @route   DELETE /api/school/portal/users/:id
// @access  Private/Admin
const deletePortalUser = async (req, res) => {
  try {
    const { PortalUser } = await getModels();
    const user = await PortalUser.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle portal user active
// @route   PUT /api/school/portal/users/:id/toggle
// @access  Private/Admin
const togglePortalUserStatus = async (req, res) => {
  try {
    const { PortalUser } = await getModels();
    const user = await PortalUser.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.active = !user.active;
    user.updatedAt = new Date();
    await user.save();
    res.json({ success: true, message: `User ${user.active ? 'activated' : 'deactivated'}`, user: { id: user._id, name: user.name, email: user.email, active: user.active } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset portal user password (admin)
// @route   PUT /api/school/portal/users/:id/reset-password
// @access  Private/Admin
const resetPortalUserPassword = async (req, res) => {
  try {
    const { PortalUser } = await getModels();
    const { newPassword } = req.body;
    const user = await PortalUser.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.password = newPassword || 'password123';
    user.updatedAt = new Date();
    await user.save();
    res.json({ success: true, message: 'Password reset', temporaryPassword: newPassword || 'password123' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, refreshToken, getProfile, updateProfile, changePassword, deactivateAccount, getAllPortalUsers, getPortalUserById, updatePortalUser, deletePortalUser, togglePortalUserStatus, resetPortalUserPassword };