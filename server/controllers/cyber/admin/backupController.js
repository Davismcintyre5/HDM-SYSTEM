// controllers/cyber/admin/backupController.js

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

// @desc    Get all tenant backups
// @route   GET /api/cyber/admin/backups
// @access  Private/SuperAdmin
const getAllBackups = async (req, res) => {
  try {
    const { Backup } = await getModels();
    const backups = await Backup.find().sort({ createdAt: -1 }).populate('tenantId', 'businessName email');
    res.json(backups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get backups by tenant
// @route   GET /api/cyber/admin/backups/tenant/:tenantId
// @access  Private/SuperAdmin
const getBackupsByTenant = async (req, res) => {
  try {
    const { Backup } = await getModels();
    const backups = await Backup.find({ tenantId: req.params.tenantId }).sort({ createdAt: -1 });
    res.json(backups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete backup
// @route   DELETE /api/cyber/admin/backups/:id
// @access  Private/SuperAdmin
const deleteBackupById = async (req, res) => {
  try {
    const { Backup } = await getModels();
    const backup = await Backup.findById(req.params.id);
    if (!backup) return res.status(404).json({ message: 'Backup not found' });

    const filepath = path.join(BACKUP_DIR, backup.filename);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);

    await Backup.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Backup deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download backup
// @route   GET /api/cyber/admin/backups/:id/download
// @access  Private/SuperAdmin
const downloadBackupFile = async (req, res) => {
  try {
    const { Backup } = await getModels();
    const backup = await Backup.findById(req.params.id);
    if (!backup) return res.status(404).json({ message: 'Backup not found' });

    const filepath = path.join(BACKUP_DIR, backup.filename);
    if (!fs.existsSync(filepath)) return res.status(404).json({ message: 'Backup file not found on disk' });

    res.download(filepath, backup.filename);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get backup stats
// @route   GET /api/cyber/admin/backups/stats
// @access  Private/SuperAdmin
const getBackupStats = async (req, res) => {
  try {
    const { Backup } = await getModels();
    const total = await Backup.countDocuments();
    const completed = await Backup.find({ status: 'completed' });
    const totalSize = completed.reduce((s, b) => s + (b.size || 0), 0);
    const byStatus = await Backup.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    res.json({ total, totalSize, byStatus });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create backup (exports all collections as pretty JSON)
// @route   POST /api/cyber/admin/backups
// @access  Private/SuperAdmin
const createBackupNow = async (req, res) => {
  try {
    const { Backup } = await getModels();

    const collections = await cyberConnection.db.listCollections().toArray();
    const data = {};

    for (const col of collections) {
      const docs = await cyberConnection.db.collection(col.name).find({}).toArray();
      data[col.name] = docs;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `cyber_db_${timestamp}.json`;
    const filepath = path.join(BACKUP_DIR, filename);

    const recordCounts = {};
    let totalRecords = 0;
    for (const [name, docs] of Object.entries(data)) {
      recordCounts[name] = docs.length;
      totalRecords += docs.length;
    }

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
    const stats = fs.statSync(filepath);

    console.log(`📦 Backup created: ${filename} (${(stats.size / 1024).toFixed(2)} KB, ${totalRecords} records)`);

    const backup = await Backup.create({
      filename,
      size: stats.size,
      collections: collections.map(c => c.name),
      recordCounts,
      status: 'completed',
      type: req.body?.scheduled ? 'scheduled' : 'manual',
      createdAt: new Date(),
    });

    // Only auto-send email for scheduled backups
    if (req.body?.scheduled) {
      const { BackupConfig } = await getModels();
      const config = await BackupConfig.findOne({ tenantId: null });
      if (config?.emailEnabled && config.emailRecipients?.length > 0) {
        const appName = await getSiteName();
        const fileContent = fs.readFileSync(filepath, 'utf-8');
        const base64Content = Buffer.from(fileContent).toString('base64');

        for (const recipient of config.emailRecipients) {
          try {
            await sendTemplateEmail('backup-completed', {
              to: recipient,
              systemName: appName,
              filename: backup.filename,
              size: stats.size,
              recordCount: totalRecords,
              date: new Date().toLocaleString(),
              hasAttachment: true,
              backupAttachment: base64Content,
              system: 'cyber',
            });
            backup.emailSent = true;
            backup.emailRecipient = recipient;
            await backup.save();
            console.log(`📧 Auto-emailed backup to ${recipient}`);
          } catch (emailErr) {
            console.error('Auto backup email failed:', emailErr.message);
          }
        }
      }
    }

    res.status(201).json({
      success: true,
      backup,
      summary: {
        collections: collections.length,
        totalRecords,
        size: `${(stats.size / 1024).toFixed(2)} KB`,
        path: filepath,
        autoEmailed: backup.emailSent || false,
      },
    });
  } catch (error) {
    console.error('Backup creation error:', error);
    res.status(500).json({ message: error.message || 'Backup failed' });
  }
};

// @desc    Email backup with file attachment
// @route   POST /api/cyber/admin/backups/:id/email
// @access  Private/SuperAdmin
const emailBackup = async (req, res) => {
  try {
    const { Backup } = await getModels();
    const backup = await Backup.findById(req.params.id);
    if (!backup) return res.status(404).json({ message: 'Backup not found' });

    const filepath = path.join(BACKUP_DIR, backup.filename);
    if (!fs.existsSync(filepath)) return res.status(404).json({ message: 'Backup file not found on disk' });

    const recipient = req.body.email || req.user.email;
    const appName = await getSiteName();

    // Calculate total records from Mongoose Map
    let totalRecords = 0;
    if (backup.recordCounts) {
      const counts = backup.recordCounts instanceof Map
        ? Object.fromEntries(backup.recordCounts)
        : backup.recordCounts;
      totalRecords = Object.values(counts).reduce((s, c) => s + (Number(c) || 0), 0);
    }

    // Read file and convert to base64 for attachment
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

    console.log(`📧 Backup emailed to ${recipient}: ${backup.filename} (${totalRecords} records, with attachment)`);
    res.json({ success: true, message: `Backup emailed to ${recipient} with attachment` });
  } catch (error) {
    console.error('Backup email error:', error);
    res.status(500).json({ message: error.message || 'Failed to email backup' });
  }
};

// @desc    Get backup config
// @route   GET /api/cyber/admin/backups/config
// @access  Private/SuperAdmin
const getBackupConfig = async (req, res) => {
  try {
    const { BackupConfig } = await getModels();
    let config = await BackupConfig.findOne({ tenantId: null });
    if (!config) {
      config = await BackupConfig.create({
        tenantId: null,
        enabled: false,
        frequency: 'weekly',
        time: '02:00',
        dayOfWeek: 0,
        dayOfMonth: 1,
        retentionDays: 30,
        emailEnabled: false,
        emailRecipients: [],
      });
    }
    res.json(config);
  } catch (error) {
    console.error('Get backup config error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update backup config
// @route   PUT /api/cyber/admin/backups/config
// @access  Private/SuperAdmin
const updateBackupConfig = async (req, res) => {
  try {
    const { BackupConfig } = await getModels();
    const updateData = { ...req.body };
    delete updateData._id;

    let config = await BackupConfig.findOne({ tenantId: null });

    if (config) {
      Object.assign(config, updateData);
      config.updatedAt = new Date();
      await config.save();
    } else {
      config = await BackupConfig.create({ ...updateData, tenantId: null });
    }

    res.json({ success: true, message: 'Backup config saved', config });
  } catch (error) {
    console.error('Update backup config error:', error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllBackups,
  getBackupsByTenant,
  deleteBackupById,
  downloadBackupFile,
  getBackupStats,
  createBackupNow,
  emailBackup,
  getBackupConfig,
  updateBackupConfig,
};