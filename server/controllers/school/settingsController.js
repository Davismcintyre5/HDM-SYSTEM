// controllers/school/settingsController.js

const { connectSchool } = require('../../config/db');

let schoolConnection;
let Settings, Inventory;

const getModels = async () => {
  if (!schoolConnection) schoolConnection = await connectSchool();
  if (!Settings) {
    Settings = schoolConnection.model('Settings');
    Inventory = schoolConnection.model('Inventory');
  }
  return { Settings, Inventory };
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
      } else {
        skipped++;
      }
    }
  }

  if (added || updated || removed || skipped) {
    console.log(`📦 Computer sync: +${added} ~${updated} -${removed} !${skipped}`);
  }
};

// @desc    Get settings (public)
// @route   GET /api/school/settings
// @access  Public
const getSettings = async (req, res) => {
  try {
    const { Settings } = await getModels();
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update settings
// @route   PUT /api/school/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
  try {
    const { Settings } = await getModels();
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();
    Object.assign(settings, req.body);
    settings.updatedAt = new Date();
    await settings.save();
    if (settings.syncComputersToInventory) await syncComputersToInventory(settings);
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Force sync computers
// @route   POST /api/school/settings/sync-computers
// @access  Private/Admin
const syncComputers = async (req, res) => {
  try {
    const { Settings } = await getModels();
    const settings = await Settings.findOne();
    if (!settings) return res.status(404).json({ message: 'Settings not found' });
    await syncComputersToInventory(settings);
    res.json({ success: true, message: 'Computers synced' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSettings, updateSettings, syncComputers };