// controllers/school/backupController.js

const { connectSchool } = require('../../config/db');
const { env } = require('../../config/env');
const { createBackup, deleteBackup, downloadBackup } = require('../../services/backupService');

let schoolConnection;
let Backup, BackupConfig;

const getModels = async () => {
  if (!schoolConnection) schoolConnection = await connectSchool();
  if (!Backup) {
    Backup = schoolConnection.model('Backup');
    BackupConfig = schoolConnection.model('BackupConfig');
  }
  return { Backup, BackupConfig };
};

// @desc    Get backup config
// @route   GET /api/school/backups/config
// @access  Private/Admin
const getBackupConfig = async (req, res) => {
  try {
    const { BackupConfig } = await getModels();
    let config = await BackupConfig.findOne();
    if (!config) config = await BackupConfig.create({});
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update backup config
// @route   PUT /api/school/backups/config
// @access  Private/Admin
const updateBackupConfig = async (req, res) => {
  try {
    const { BackupConfig } = await getModels();
    const config = await BackupConfig.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json(config);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all backups
// @route   GET /api/school/backups
// @access  Private/Admin
const getAllBackups = async (req, res) => {
  try {
    const { Backup } = await getModels();
    const backups = await Backup.find().sort({ createdAt: -1 });
    res.json(backups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create backup
// @route   POST /api/school/backups
// @access  Private/Admin
const createBackupNow = async (req, res) => {
  try {
    const { Backup, BackupConfig } = await getModels();
    const config = await BackupConfig.findOne();
    const backup = await createBackup({
      dbUri: env.SCHOOL_MONGODB_URI,
      dbName: 'school_db',
      collections: config?.collections || [],
      backupModel: Backup,
      config,
      systemName: 'School System',
      emailRecipients: config?.emailRecipients || [],
    });
    res.status(201).json(backup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete backup
// @route   DELETE /api/school/backups/:id
// @access  Private/Admin
const deleteBackupById = async (req, res) => {
  try {
    const { Backup } = await getModels();
    const backup = await Backup.findById(req.params.id);
    if (!backup) return res.status(404).json({ message: 'Backup not found' });
    await deleteBackup(backup.filename, Backup);
    res.json({ message: 'Backup deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download backup
// @route   GET /api/school/backups/:id/download
// @access  Private/Admin
const downloadBackupFile = async (req, res) => {
  try {
    const { Backup } = await getModels();
    const backup = await Backup.findById(req.params.id);
    if (!backup) return res.status(404).json({ message: 'Backup not found' });
    const filepath = downloadBackup(backup.filename);
    res.download(filepath, backup.filename);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Email backup
// @route   POST /api/school/backups/:id/email
// @access  Private/Admin
const emailBackup = async (req, res) => {
  try {
    const { Backup } = await getModels();
    const backup = await Backup.findById(req.params.id);
    if (!backup) return res.status(404).json({ message: 'Backup not found' });
    const { sendTemplateEmail } = require('../../services/emailService');
    const filepath = downloadBackup(backup.filename);
    await sendTemplateEmail('backup-completed', {
      to: req.body.email || req.user.email,
      systemName: 'School System',
      filename: backup.filename,
      size: backup.size,
      recordCount: 0,
      date: new Date().toLocaleString(),
      system: 'school',
    });
    backup.emailSent = true;
    backup.emailRecipient = req.body.email || req.user.email;
    await backup.save();
    res.json({ success: true, message: 'Backup emailed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBackupConfig, updateBackupConfig, getAllBackups, createBackupNow, deleteBackupById, downloadBackupFile, emailBackup };