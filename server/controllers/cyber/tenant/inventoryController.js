const { connectCyber } = require('../../../config/db');

let cyberConnection;
let Inventory;

const getModels = async () => {
  if (!cyberConnection) cyberConnection = await connectCyber();
  if (!Inventory) Inventory = cyberConnection.model('Inventory');
  return { Inventory };
};

// @desc    Get all inventory
// @route   GET /api/cyber/tenant/inventory
// @access  Private/Tenant
const getAllInventory = async (req, res) => {
  try {
    const { Inventory } = await getModels();
    const items = await Inventory.find({ tenantId: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get inventory by ID
// @route   GET /api/cyber/tenant/inventory/:id
// @access  Private/Tenant
const getInventoryById = async (req, res) => {
  try {
    const { Inventory } = await getModels();
    const item = await Inventory.findOne({ _id: req.params.id, tenantId: req.user.id });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create inventory item
// @route   POST /api/cyber/tenant/inventory
// @access  Private/Tenant
const createInventory = async (req, res) => {
  try {
    const { Inventory } = await getModels();
    const item = await Inventory.create({ ...req.body, tenantId: req.user.id });
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update inventory
// @route   PUT /api/cyber/tenant/inventory/:id
// @access  Private/Tenant
const updateInventory = async (req, res) => {
  try {
    const { Inventory } = await getModels();
    const item = await Inventory.findOneAndUpdate({ _id: req.params.id, tenantId: req.user.id }, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete inventory
// @route   DELETE /api/cyber/tenant/inventory/:id
// @access  Private/Tenant
const deleteInventory = async (req, res) => {
  try {
    const { Inventory } = await getModels();
    const item = await Inventory.findOneAndDelete({ _id: req.params.id, tenantId: req.user.id });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get inventory stats
// @route   GET /api/cyber/tenant/inventory/stats
// @access  Private/Tenant
const getInventoryStats = async (req, res) => {
  try {
    const { Inventory } = await getModels();
    const items = await Inventory.find({ tenantId: req.user.id });
    const totalValue = items.reduce((s, i) => s + (i.value || 0) * (i.quantity || 1), 0);
    const byType = items.reduce((acc, i) => { acc[i.type] = (acc[i.type] || 0) + (i.quantity || 1); return acc; }, {});
    res.json({ totalItems: items.length, totalValue, byType });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllInventory, getInventoryById, createInventory, updateInventory, deleteInventory, getInventoryStats };