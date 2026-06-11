// controllers/school/inventoryController.js

const { connectSchool } = require('../../config/db');

let schoolConnection;
let Inventory, Student, Employee, Settings;

const getModels = async () => {
  if (!schoolConnection) schoolConnection = await connectSchool();
  if (!Inventory) {
    Inventory = schoolConnection.model('Inventory');
    Student = schoolConnection.model('Student');
    Employee = schoolConnection.model('Employee');
    Settings = schoolConnection.model('Settings');
  }
  return { Inventory, Student, Employee, Settings };
};

const generateComputerList = (settings) => {
  if (!settings?.computers) return [];
  const { computers } = settings;
  const defaultVal = computers.defaultValue ?? 0;
  if (computers.mode === 'range') {
    const { start, end, prefix } = computers.range;
    const list = [];
    for (let i = start; i <= end; i++) list.push({ name: `${prefix}${String(i).padStart(2, '0')}`, value: defaultVal });
    return list;
  }
  return (computers.manualList || []).map(item => ({
    name: typeof item === 'string' ? item : item.name,
    value: typeof item === 'object' ? item.value ?? defaultVal : defaultVal,
  }));
};

const syncComputersToInventory = async (settings) => {
  const { Inventory } = await getModels();
  const computerList = generateComputerList(settings);
  const computerNames = computerList.map(c => c.name);
  const existingComputers = await Inventory.find({ type: 'Computer' });
  const existingMap = new Map(existingComputers.map(c => [c.name, c]));
  let added = 0, updated = 0, removed = 0, skipped = 0;

  for (const computer of computerList) {
    const existing = existingMap.get(computer.name);
    if (!existing) {
      await Inventory.create({ name: computer.name, type: 'Computer', value: computer.value, status: 'Available', notes: 'Auto-created from settings' });
      added++;
    } else if (existing.value !== computer.value) {
      existing.value = computer.value;
      await existing.save();
      updated++;
    }
  }

  for (const existing of existingComputers) {
    if (!computerNames.includes(existing.name)) {
      if (existing.status !== 'Assigned') {
        await Inventory.findByIdAndDelete(existing._id);
        removed++;
      } else skipped++;
    }
  }

  if (added || updated || removed || skipped) {
    console.log(`📦 Computer sync: +${added} ~${updated} -${removed} !${skipped}`);
  }
};

// @desc    Get available computers
// @route   GET /api/school/inventory/available-computers
// @access  Private/Admin
const getAvailableComputers = async (req, res) => {
  try {
    const { Inventory } = await getModels();
    const allComputers = await Inventory.find({ type: 'Computer' });
    const available = allComputers.filter(c => c.status === 'Available').map(c => c.name);
    const occupied = allComputers.filter(c => c.status === 'Assigned').map(c => c.name);
    res.json({ available, occupied, allComputers: allComputers.map(c => c.name) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all inventory
// @route   GET /api/school/inventory
// @access  Private/Admin
const getAllInventory = async (req, res) => {
  try {
    const { Inventory } = await getModels();
    const items = await Inventory.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get inventory by ID
// @route   GET /api/school/inventory/:id
// @access  Private/Admin
const getInventoryById = async (req, res) => {
  try {
    const { Inventory } = await getModels();
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get inventory by type
// @route   GET /api/school/inventory/type/:type
// @access  Private/Admin
const getInventoryByType = async (req, res) => {
  try {
    const { Inventory } = await getModels();
    const items = await Inventory.find({ type: req.params.type }).sort({ name: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create inventory item
// @route   POST /api/school/inventory
// @access  Private/Admin
const createInventory = async (req, res) => {
  try {
    const { Inventory } = await getModels();
    const existing = await Inventory.findOne({ name: req.body.name });
    if (existing) return res.status(400).json({ message: 'Item name already exists' });
    const item = await Inventory.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update inventory
// @route   PUT /api/school/inventory/:id
// @access  Private/Admin
const updateInventory = async (req, res) => {
  try {
    const { Inventory } = await getModels();
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (req.body.name && req.body.name !== item.name) {
      if (await Inventory.findOne({ name: req.body.name })) return res.status(400).json({ message: 'Item name already exists' });
    }
    if (item.status === 'Assigned' && req.body.status !== 'Assigned') {
      req.body.assignedTo = null;
      req.body.assignedModel = null;
    }
    Object.assign(item, req.body);
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete inventory
// @route   DELETE /api/school/inventory/:id
// @access  Private/Admin
const deleteInventory = async (req, res) => {
  try {
    const { Inventory } = await getModels();
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.status === 'Assigned') return res.status(400).json({ message: 'Cannot delete assigned asset' });
    await item.deleteOne();
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get inventory stats
// @route   GET /api/school/inventory/stats
// @access  Private/Admin
const getInventoryStats = async (req, res) => {
  try {
    const { Inventory } = await getModels();
    const all = await Inventory.find();
    const totalValue = all.reduce((s, i) => s + (i.value || 0), 0);
    const byType = all.reduce((acc, i) => { acc[i.type] = (acc[i.type] || 0) + (i.value || 0); return acc; }, {});
    res.json({ totalValue, byType, totalItems: all.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign inventory
// @route   POST /api/school/inventory/assign
// @access  Private/Admin
const assignInventory = async (req, res) => {
  try {
    const { Inventory, Student, Employee } = await getModels();
    const { itemId, assignToId, assignType } = req.body;
    const item = await Inventory.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.status === 'Assigned') return res.status(400).json({ message: 'Item already assigned' });

    let person;
    if (assignType === 'Student') { person = await Student.findById(assignToId); if (!person) return res.status(404).json({ message: 'Student not found' }); }
    else if (assignType === 'Employee') { person = await Employee.findById(assignToId); if (!person) return res.status(404).json({ message: 'Employee not found' }); }
    else return res.status(400).json({ message: 'Invalid assign type' });

    item.status = 'Assigned'; item.assignedTo = assignToId; item.assignedModel = assignType;
    await item.save();
    res.json({ message: `Item assigned to ${person.name}`, item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unassign inventory
// @route   POST /api/school/inventory/:id/unassign
// @access  Private/Admin
const unassignInventory = async (req, res) => {
  try {
    const { Inventory } = await getModels();
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.status !== 'Assigned') return res.status(400).json({ message: 'Item not currently assigned' });
    item.status = 'Available'; item.assignedTo = null; item.assignedModel = null;
    await item.save();
    res.json({ message: 'Item unassigned', item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllInventory, getInventoryById, getInventoryByType, createInventory, updateInventory, deleteInventory, getInventoryStats, assignInventory, unassignInventory, getAvailableComputers };