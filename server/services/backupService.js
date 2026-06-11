// services/backupService.js

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { sendTemplateEmail } = require('./emailService');

const BACKUP_DIR = path.join(__dirname, '..', 'backups');

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const createBackup = async ({ dbUri, dbName, collections = [], backupModel, config, systemName, emailRecipients }) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${dbName}_${timestamp}.gz`;
  const filepath = path.join(BACKUP_DIR, filename);

  try {
    const backup = await backupModel.create({
      filename,
      status: 'in_progress',
      type: 'manual',
      collections,
    });

    const collectionArgs = collections.length > 0
      ? collections.map(c => `--collection=${c}`).join(' ')
      : '';

    const cmd = `mongodump --uri="${dbUri}" ${collectionArgs} --archive="${filepath}" --gzip`;

    return new Promise((resolve, reject) => {
      exec(cmd, async (error, stdout, stderr) => {
        if (error) {
          backup.status = 'failed';
          backup.errorMessage = stderr || error.message;
          await backup.save();
          return reject(error);
        }

        const stats = fs.statSync(filepath);
        backup.status = 'completed';
        backup.size = stats.size;
        backup.recordCounts = {};
        await backup.save();

        if (config?.emailEnabled && emailRecipients?.length > 0) {
          for (const recipient of emailRecipients) {
            try {
              await sendTemplateEmail('backup-completed', {
                to: recipient,
                systemName,
                filename,
                size: stats.size,
                recordCount: 0,
                date: new Date().toLocaleString(),
              });
              backup.emailSent = true;
              await backup.save();
            } catch (emailErr) {
              console.error('Backup email error:', emailErr);
            }
          }
        }

        resolve(backup);
      });
    });
  } catch (error) {
    console.error('Backup creation error:', error);
    throw error;
  }
};

const deleteBackup = async (filename, backupModel) => {
  const filepath = path.join(BACKUP_DIR, filename);
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
  await backupModel.findOneAndDelete({ filename });
  return { success: true, message: 'Backup deleted' };
};

const downloadBackup = (filename) => {
  const filepath = path.join(BACKUP_DIR, filename);
  if (!fs.existsSync(filepath)) {
    throw new Error('Backup file not found');
  }
  return filepath;
};

const cleanupOldBackups = async (backupModel, retentionDays = 30) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - retentionDays);

  const oldBackups = await backupModel.find({ createdAt: { $lt: cutoff } });

  for (const backup of oldBackups) {
    const filepath = path.join(BACKUP_DIR, backup.filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    await backup.deleteOne();
  }

  return { deleted: oldBackups.length };
};

module.exports = { createBackup, deleteBackup, downloadBackup, cleanupOldBackups };