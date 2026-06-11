// config/db.js

const mongoose = require('mongoose');
const { env } = require('./env');

let schoolConn = null;
let cyberConn = null;

const extractHost = (uri) => {
  try {
    const url = new URL(uri);
    return url.hostname.includes('mongodb.net') ? 'MongoDB Atlas' : url.hostname + ':' + (url.port || '27017');
  } catch {
    return 'unknown';
  }
};

const connectSchool = async () => {
  if (schoolConn?.readyState === 1) return schoolConn;
  schoolConn = await mongoose.createConnection(env.SCHOOL_MONGODB_URI);

  schoolConn.model('User', require('../models/school/User'));
  schoolConn.model('Student', require('../models/school/Student'));
  schoolConn.model('Employee', require('../models/school/Employee'));
  schoolConn.model('PortalUser', require('../models/school/PortalUser'));
  schoolConn.model('Fee', require('../models/school/Fee'));
  schoolConn.model('Transaction', require('../models/school/Transaction'));
  schoolConn.model('Inventory', require('../models/school/Inventory'));
  schoolConn.model('Settings', require('../models/school/Settings'));
  schoolConn.model('Application', require('../models/school/Application'));
  schoolConn.model('CertificateCounter', require('../models/school/CertificateCounter'));
  schoolConn.model('Backup', require('../models/school/Backup'));
  schoolConn.model('BackupConfig', require('../models/school/BackupConfig'));

  console.log(`\x1b[32m✅ School DB connected\x1b[0m — \x1b[36mschool_db\x1b[0m @ \x1b[90m${extractHost(env.SCHOOL_MONGODB_URI)}\x1b[0m`);
  schoolConn.on('error', (err) => console.error('\x1b[31m❌ School DB error:\x1b[0m', err));
  return schoolConn;
};

const connectCyber = async () => {
  if (cyberConn?.readyState === 1) return cyberConn;
  cyberConn = await mongoose.createConnection(env.CYBER_MONGODB_URI);

  cyberConn.model('SuperAdmin', require('../models/cyber/SuperAdmin'));
  cyberConn.model('Tenant', require('../models/cyber/Tenant'));
  cyberConn.model('Plan', require('../models/cyber/Plan'));
  cyberConn.model('Service', require('../models/cyber/Service'));
  cyberConn.model('Account', require('../models/cyber/Account'));
  cyberConn.model('Inventory', require('../models/cyber/Inventory'));
  cyberConn.model('Transaction', require('../models/cyber/Transaction'));
  cyberConn.model('Setting', require('../models/cyber/Setting'));
  cyberConn.model('SupportTicket', require('../models/cyber/SupportTicket'));
  cyberConn.model('Backup', require('../models/cyber/Backup'));
  cyberConn.model('BackupConfig', require('../models/cyber/BackupConfig'));
  cyberConn.model('Legal', require('../models/cyber/Legal'));
  cyberConn.model('SiteSettings', require('../models/cyber/SiteSettings'));
  cyberConn.model('Invoice', require('../models/cyber/Invoice'));

  console.log(`\x1b[32m✅ Cyber DB connected\x1b[0m — \x1b[36mcyber_db\x1b[0m @ \x1b[90m${extractHost(env.CYBER_MONGODB_URI)}\x1b[0m`);
  cyberConn.on('error', (err) => console.error('\x1b[31m❌ Cyber DB error:\x1b[0m', err));
  return cyberConn;
};

const getSchoolConn = () => schoolConn;
const getCyberConn = () => cyberConn;

module.exports = { connectSchool, connectCyber, getSchoolConn, getCyberConn };