const { connectCyber } = require('../../../config/db');

let cyberConnection;
let Service;

const getModels = async () => {
  if (!cyberConnection) cyberConnection = await connectCyber();
  if (!Service) Service = cyberConnection.model('Service');
  return { Service };
};

// @desc    Get all services
// @route   GET /api/cyber/tenant/services
// @access  Private/Tenant
const getAllServices = async (req, res) => {
  try {
    const { Service } = await getModels();
    const services = await Service.find({ tenantId: req.user.id }).sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get service by ID
// @route   GET /api/cyber/tenant/services/:id
// @access  Private/Tenant
const getServiceById = async (req, res) => {
  try {
    const { Service } = await getModels();
    const service = await Service.findOne({ _id: req.params.id, tenantId: req.user.id });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create service
// @route   POST /api/cyber/tenant/services
// @access  Private/Tenant
const createService = async (req, res) => {
  try {
    const { Service } = await getModels();
    const service = await Service.create({ ...req.body, tenantId: req.user.id });
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update service
// @route   PUT /api/cyber/tenant/services/:id
// @access  Private/Tenant
const updateService = async (req, res) => {
  try {
    const { Service } = await getModels();
    const service = await Service.findOneAndUpdate({ _id: req.params.id, tenantId: req.user.id }, req.body, { new: true });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete service
// @route   DELETE /api/cyber/tenant/services/:id
// @access  Private/Tenant
const deleteService = async (req, res) => {
  try {
    const { Service } = await getModels();
    const service = await Service.findOneAndDelete({ _id: req.params.id, tenantId: req.user.id });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllServices, getServiceById, createService, updateService, deleteService };