// controllers/cyber/tenant/backupController.js

const { connectCyber } = require('../../../config/db');
const { sendTemplateEmail } = require('../../../services/emailService');
const { env } = require('../../../config/env');
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(process.cwd(), 'backups');
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`📁 Created backup directory: ${BACKUP_DIR}`);
}

let cyberConnection;
let Backup, BackupConfig, SiteSettings;

const getModels = async () => {
  if (!cyberConnection) cyberConnection = await connectCyber();
  if (!Backup) {
    Backup = cyberConnection.model('Backup');
    BackupConfig = cyberConnection.model('BackupConfig');
    SiteSettings = cyberConnection.model('SiteSettings');
  }
  return { Backup, BackupConfig, SiteSettings };
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

// @desc    Get all backups
// @route   GET /api/cyber/tenant/backups
// @access  Private/Tenant
const getAllBackups = async (req, res) => {
  try {
    const { Backup } = await getModels();
    const backups = await Backup.find({ tenantId: req.user.id }).sort({ createdAt: -1 });
    res.json(backups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// controllers/cyber/tenant/backupController.js — update createBackupNow

const createBackupNow = async (req, res) => {
  try {
    const { Backup } = await getModels(); // This sets cyberConnection
    
    const collections = await cyberConnection.db.listCollections().toArray();
    const data = {};

    for (const col of collections) {
      const docs = await cyberConnection.db.collection(col.name).find({ tenantId: req.user.id }).toArray();
      if (docs.length > 0) {
        data[col.name] = docs;
      }
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `tenant_${req.user.id}_${timestamp}.json`;
    const filepath = path.join(BACKUP_DIR, filename);

    const recordCounts = {};
    let totalRecords = 0;
    for (const [name, docs] of Object.entries(data)) {
      recordCounts[name] = docs.length;
      totalRecords += docs.length;
    }

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
    const stats = fs.statSync(filepath);

    const backup = await Backup.create({
      tenantId: req.user.id,
      filename,
      size: stats.size,
      collections: Object.keys(data),
      recordCounts,
      status: 'completed',
      type: 'manual',
      createdAt: new Date(),
    });

    console.log(`📦 Tenant backup created: ${filename} (${(stats.size / 1024).toFixed(2)} KB, ${totalRecords} records)`);

    res.status(201).json({
      success: true,
      backup,
      summary: { collections: Object.keys(data).length, totalRecords, size: `${(stats.size / 1024).toFixed(2)} KB` },
    });
  } catch (error) {
    console.error('Tenant backup error:', error);
    res.status(500).json({ message: error.message || 'Backup failed' });
  }
};

// @desc    Delete backup
// @route   DELETE /api/cyber/tenant/backups/:id
// @access  Private/Tenant
const deleteBackupById = async (req, res) => {
  try {
    const { Backup } = await getModels();
    const backup = await Backup.findOne({ _id: req.params.id, tenantId: req.user.id });
    if (!backup) return res.status(404).json({ message: 'Backup not found' });

    const filepath = path.join(BACKUP_DIR, backup.filename);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);

    await Backup.findByIdAndDelete(req.params.id);
    res.json({ message: 'Backup deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download backup
// @route   GET /api/cyber/tenant/backups/:id/download
// @access  Private/Tenant
const downloadBackupFile = async (req, res) => {
  try {
    const { Backup } = await getModels();
    const backup = await Backup.findOne({ _id: req.params.id, tenantId: req.user.id });
    if (!backup) return res.status(404).json({ message: 'Backup not found' });

    const filepath = path.join(BACKUP_DIR, backup.filename);
    if (!fs.existsSync(filepath)) return res.status(404).json({ message: 'File not found' });

    res.download(filepath, backup.filename);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Email backup
// @route   POST /api/cyber/tenant/backups/:id/email
// @access  Private/Tenant
const emailBackup = async (req, res) => {
  try {
    const { Backup } = await getModels();
    const backup = await Backup.findOne({ _id: req.params.id, tenantId: req.user.id });
    if (!backup) return res.status(404).json({ message: 'Backup not found' });

    const filepath = path.join(BACKUP_DIR, backup.filename);
    if (!fs.existsSync(filepath)) return res.status(404).json({ message: 'File not found' });

    const recipient = req.body.email || req.user.email;
    const totalRecords = Object.values(backup.recordCounts || {}).reduce((s, c) => s + (Number(c) || 0), 0);
    const appName = await getSiteName();

    const fileContent = fs.readFileSync(filepath, 'utf-8');
    const base64Content = Buffer.from(fileContent).toString('base64');

    await sendTemplateEmail('backup-completed', {
      to: recipient,
      systemName: appName,
      filename: backup.filename,
      size: backup.size,
      recordCount: totalRecords,
      date: new Date().toLocaleString(),
      hasAttachment: true,
      backupAttachment: base64Content,
      system: 'cyber',
    });

    backup.emailSent = true;
    backup.emailRecipient = recipient;
    await backup.save();

    res.json({ success: true, message: `Backup emailed to ${recipient}` });
  } catch (error) {
    console.error('Tenant backup email error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllBackups, createBackupNow, deleteBackupById, downloadBackupFile, emailBackup };