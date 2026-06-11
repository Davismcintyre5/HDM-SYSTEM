// controllers/school/authController.js

const jwt = require('jsonwebtoken');
const { connectSchool } = require('../../config/db');
const { env } = require('../../config/env');
const { generateTokens } = require('../../middleware/auth');

let schoolConnection;
let User;

const getModels = async () => {
  if (!schoolConnection) schoolConnection = await connectSchool();
  if (!User) User = schoolConnection.model('User');
  return { User };
};

// @desc    Login admin/staff
// @route   POST /api/school/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { User } = await getModels();
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    const user = await User.findOne({ email, active: true });
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: 'Invalid credentials' });
    user.lastLogin = new Date();
    await user.save();
    const payload = { id: user._id, email: user.email, role: user.role, system: 'school_admin' };
    const tokens = generateTokens(payload, env.SCHOOL_JWT_SECRET, env.SCHOOL_REFRESH_SECRET, env.SCHOOL_JWT_EXPIRE, env.SCHOOL_REFRESH_EXPIRE);
    res.json({ success: true, ...tokens, user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register new admin/staff
// @route   POST /api/school/auth/register
// @access  Private/Admin
const register = async (req, res) => {
  try {
    const { User } = await getModels();
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });
    const user = new User({ name, email, password, role: role || 'staff' });
    await user.save();
    res.status(201).json({ success: true, message: 'User created', user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Refresh token
// @route   POST /api/school/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(400).json({ message: 'Refresh token required' });
    const decoded = jwt.verify(token, env.SCHOOL_REFRESH_SECRET);
    const payload = { id: decoded.id, email: decoded.email, role: decoded.role, system: 'school_admin' };
    const tokens = generateTokens(payload, env.SCHOOL_JWT_SECRET, env.SCHOOL_REFRESH_SECRET, env.SCHOOL_JWT_EXPIRE, env.SCHOOL_REFRESH_EXPIRE);
    res.json({ success: true, ...tokens });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// @desc    Change password
// @route   PUT /api/school/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { User } = await getModels();
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ message: 'Both passwords required' });
    const user = await User.findById(req.user.id);
    if (!user || !(await user.comparePassword(oldPassword))) return res.status(401).json({ message: 'Old password incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/school/auth/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const { User } = await getModels();
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/school/auth/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const { User } = await getModels();
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/school/auth/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { User } = await getModels();
    const { role } = req.body;
    if (!role || !['admin', 'staff'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, message: `Role updated to ${role}`, user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/school/auth/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const { User } = await getModels();
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (user.role === 'admin' && adminCount <= 1) return res.status(400).json({ message: 'Cannot delete last admin' });
    await user.deleteOne();
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { login, register, refreshToken, changePassword, getAllUsers, getUserById, updateUserRole, deleteUser };