// controllers/cyber/admin/subscriptionController.js

const { connectCyber } = require('../../../config/db');

let cyberConnection;
let Plan;

const getModels = async () => {
  if (!cyberConnection) cyberConnection = await connectCyber();
  if (!Plan) Plan = cyberConnection.model('Plan');
  return { Plan };
};

// @desc    Get all plans (public)
// @route   GET /api/cyber/admin/plans
// @access  Public
const getAllPlans = async (req, res) => {
  try {
    const { Plan } = await getModels();
    const plans = await Plan.find({ active: true }).sort({ order: 1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all plans (admin)
// @route   GET /api/cyber/admin/plans/all
// @access  Private/SuperAdmin
const getAllPlansAdmin = async (req, res) => {
  try {
    const { Plan } = await getModels();
    const plans = await Plan.find().sort({ order: 1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get plan by ID
// @route   GET /api/cyber/admin/plans/:id
// @access  Private/SuperAdmin
const getPlanById = async (req, res) => {
  try {
    const { Plan } = await getModels();
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create plan
// @route   POST /api/cyber/admin/plans
// @access  Private/SuperAdmin
const createPlan = async (req, res) => {
  try {
    const { Plan } = await getModels();
    const plan = await Plan.create(req.body);
    res.status(201).json(plan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update plan
// @route   PUT /api/cyber/admin/plans/:id
// @access  Private/SuperAdmin
const updatePlan = async (req, res) => {
  try {
    const { Plan } = await getModels();
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json(plan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete plan
// @route   DELETE /api/cyber/admin/plans/:id
// @access  Private/SuperAdmin
const deletePlan = async (req, res) => {
  try {
    const { Plan } = await getModels();
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json({ message: 'Plan deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllPlans, getAllPlansAdmin, getPlanById, createPlan, updatePlan, deletePlan };