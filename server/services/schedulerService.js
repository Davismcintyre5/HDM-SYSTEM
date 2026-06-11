// services/schedulerService.js

const cron = require('node-cron');
const { connectSchool, connectCyber } = require('../config/db');
const { createBackup, cleanupOldBackups } = require('./backupService');
const { sendTemplateEmail } = require('./emailService');
const { env } = require('../config/env');

let schoolModels = {};
let cyberModels = {};

const initSchoolModels = async () => {
  if (Object.keys(schoolModels).length > 0) return schoolModels;
  const conn = await connectSchool();
  schoolModels = {
    Backup: conn.model('Backup'),
    BackupConfig: conn.model('BackupConfig'),
  };
  return schoolModels;
};

const initCyberModels = async () => {
  if (Object.keys(cyberModels).length > 0) return cyberModels;
  const conn = await connectCyber();
  cyberModels = {
    Tenant: conn.model('Tenant'),
    Backup: conn.model('Backup'),
    BackupConfig: conn.model('BackupConfig'),
    SiteSettings: conn.model('SiteSettings'),
  };
  return cyberModels;
};

const getSiteName = async () => {
  try {
    const { SiteSettings } = await initCyberModels();
    const settings = await SiteSettings.findOne();
    return settings?.siteName || env.APP_NAME_CYBER;
  } catch {
    return env.APP_NAME_CYBER;
  }
};

const shouldRunNow = (config) => {
  const now = new Date();
  const [hours, minutes] = (config.time || '02:00').split(':').map(Number);
  if (now.getHours() !== hours || now.getMinutes() !== minutes) return false;
  switch (config.frequency) {
    case 'daily': return true;
    case 'weekly': return now.getDay() === config.dayOfWeek;
    case 'monthly': return now.getDate() === config.dayOfMonth;
    default: return false;
  }
};

const getNextRunTime = (config) => {
  const now = new Date();
  const [hours, minutes] = (config.time || '02:00').split(':').map(Number);
  const next = new Date(now);
  next.setHours(hours, minutes, 0, 0);
  switch (config.frequency) {
    case 'daily':
      if (next <= now) next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + ((7 + config.dayOfWeek - now.getDay()) % 7));
      if (next <= now) next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setDate(config.dayOfMonth);
      if (next <= now) next.setMonth(next.getMonth() + 1);
      break;
  }
  return next;
};

const scheduleBackups = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('🔍 Checking scheduled backups...');
    try {
      const { Backup: SchoolBackup, BackupConfig: SchoolBackupConfig } = await initSchoolModels();
      const schoolConfig = await SchoolBackupConfig.findOne({ enabled: true });
      if (schoolConfig && shouldRunNow(schoolConfig)) {
        console.log('📦 Running school backup...');
        await createBackup({
          dbUri: env.SCHOOL_MONGODB_URI,
          dbName: 'school_db',
          collections: schoolConfig.collections,
          backupModel: SchoolBackup,
          config: schoolConfig,
          systemName: 'School System',
          emailRecipients: schoolConfig.emailRecipients,
        });
        schoolConfig.lastRunAt = new Date();
        schoolConfig.nextRunAt = getNextRunTime(schoolConfig);
        await schoolConfig.save();
      }

      const { Backup: CyberBackup, BackupConfig: CyberBackupConfig, Tenant } = await initCyberModels();
      const tenantConfigs = await CyberBackupConfig.find({ enabled: true });
      for (const config of tenantConfigs) {
        if (shouldRunNow(config)) {
          const tenant = await Tenant.findById(config.tenantId);
          if (tenant) {
            console.log(`📦 Running backup for: ${tenant.businessName}`);
            await createBackup({
              dbUri: env.CYBER_MONGODB_URI,
              dbName: 'cyber_db',
              collections: config.collections,
              backupModel: CyberBackup,
              config,
              systemName: tenant.businessName,
              emailRecipients: config.emailRecipients,
            });
            config.lastRunAt = new Date();
            config.nextRunAt = getNextRunTime(config);
            await config.save();
          }
        }
      }
    } catch (error) {
      console.error('Scheduled backup error:', error);
    }
  });
};

const scheduleTrialCheck = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('🔍 Checking trial expirations...');
    try {
      const { Tenant } = await initCyberModels();
      const now = new Date();

      await Tenant.updateMany({
        plan: 'trial',
        status: 'active',
        trialEndDate: { $lt: now },
      }, { status: 'expired' });

      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      const expiringTrials = await Tenant.find({
        plan: 'trial',
        status: 'active',
        trialEndDate: { $gte: now, $lte: threeDaysFromNow },
      });

      const appName = await getSiteName();
      for (const tenant of expiringTrials) {
        sendTemplateEmail('cyber-subscription-renewal', {
          to: tenant.email,
          name: tenant.ownerName,
          plan: 'Free Trial',
          expiryDate: tenant.trialEndDate.toLocaleDateString(),
          daysLeft: Math.ceil((tenant.trialEndDate - now) / (1000 * 60 * 60 * 24)),
          renewUrl: `${env.CYBER_URL}/renew`,
          appName,
          system: 'cyber',
        }).catch(err => console.error('Trial renewal email failed:', err.message));
      }
    } catch (error) {
      console.error('Trial check error:', error);
    }
  });
};

const scheduleSubscriptionCheck = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('🔍 Checking subscription expirations...');
    try {
      const { Tenant } = await initCyberModels();
      const now = new Date();

      await Tenant.updateMany({
        plan: { $in: ['monthly', 'yearly'] },
        status: 'active',
        subscriptionEndDate: { $lt: now },
      }, { status: 'expired' });

      const fiveDaysFromNow = new Date();
      fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);

      const expiringSubs = await Tenant.find({
        plan: { $in: ['monthly', 'yearly'] },
        status: 'active',
        subscriptionEndDate: { $gte: now, $lte: fiveDaysFromNow },
      });

      const appName = await getSiteName();
      for (const tenant of expiringSubs) {
        sendTemplateEmail('cyber-subscription-renewal', {
          to: tenant.email,
          name: tenant.ownerName,
          plan: tenant.plan,
          expiryDate: tenant.subscriptionEndDate.toLocaleDateString(),
          daysLeft: Math.ceil((tenant.subscriptionEndDate - now) / (1000 * 60 * 60 * 24)),
          renewUrl: `${env.CYBER_URL}/renew`,
          appName,
          system: 'cyber',
        }).catch(err => console.error('Subscription renewal email failed:', err.message));
      }
    } catch (error) {
      console.error('Subscription check error:', error);
    }
  });
};

const scheduleBackupCleanup = () => {
  cron.schedule('0 2 * * 0', async () => {
    console.log('🧹 Cleaning up old backups...');
    try {
      const { Backup: SchoolBackup, BackupConfig: SchoolBackupConfig } = await initSchoolModels();
      const schoolConfig = await SchoolBackupConfig.findOne();
      if (schoolConfig?.retentionDays) {
        await cleanupOldBackups(SchoolBackup, schoolConfig.retentionDays);
      }

      const { Backup: CyberBackup, BackupConfig: CyberBackupConfig } = await initCyberModels();
      const tenantConfigs = await CyberBackupConfig.find({});
      for (const config of tenantConfigs) {
        if (config.retentionDays) {
          await cleanupOldBackups(CyberBackup, config.retentionDays);
        }
      }
    } catch (error) {
      console.error('Backup cleanup error:', error);
    }
  });
};

const startScheduler = () => {
  console.log('⏰ Starting schedulers...');
  scheduleBackups();
  scheduleTrialCheck();
  scheduleSubscriptionCheck();
  scheduleBackupCleanup();
  console.log('✅ Schedulers started');
};

module.exports = { startScheduler };