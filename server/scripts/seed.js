// scripts/seed.js

const readline = require('readline');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

let connection = null;
let selectedDB = '';

const connectDB = async (dbUri, dbName) => {
  if (connection) await connection.close();
  connection = await mongoose.createConnection(dbUri);

  if (dbName === 'school_db') {
    connection.model('User', require('../models/school/User'));
    connection.model('Student', require('../models/school/Student'));
    connection.model('Employee', require('../models/school/Employee'));
    connection.model('PortalUser', require('../models/school/PortalUser'));
    connection.model('Fee', require('../models/school/Fee'));
    connection.model('Transaction', require('../models/school/Transaction'));
    connection.model('Inventory', require('../models/school/Inventory'));
    connection.model('Settings', require('../models/school/Settings'));
    connection.model('Application', require('../models/school/Application'));
    connection.model('CertificateCounter', require('../models/school/CertificateCounter'));
    connection.model('Backup', require('../models/school/Backup'));
    connection.model('BackupConfig', require('../models/school/BackupConfig'));
  } else {
    connection.model('SuperAdmin', require('../models/cyber/SuperAdmin'));
    connection.model('Tenant', require('../models/cyber/Tenant'));
    connection.model('Plan', require('../models/cyber/Plan'));
    connection.model('Service', require('../models/cyber/Service'));
    connection.model('Account', require('../models/cyber/Account'));
    connection.model('Inventory', require('../models/cyber/Inventory'));
    connection.model('Transaction', require('../models/cyber/Transaction'));
    connection.model('Setting', require('../models/cyber/Setting'));
    connection.model('SupportTicket', require('../models/cyber/SupportTicket'));
    connection.model('Backup', require('../models/cyber/Backup'));
    connection.model('BackupConfig', require('../models/cyber/BackupConfig'));
    connection.model('Legal', require('../models/cyber/Legal'));
  }

  console.log(`\n✅ Connected to ${dbName}\n`);
  return connection;
};

// ==================== SCHOOL SEED ====================

const seedSchoolAll = async () => {
  console.log('\n🌱 Seeding School Database...\n');

  const Settings = connection.model('Settings');
  const existingSettings = await Settings.findOne();
  if (!existingSettings) {
    await Settings.create({
      schoolName: 'HDM Computer School',
      motto: 'Technology for Tomorrow',
      address: 'Nairobi, Kenya',
      phone: '+254 700 123 456',
      email: 'info@hdmcomputerschool.ac.ke',
      courses: [
        { name: 'Computer Basics', description: 'Introduction to computers, Windows, and office applications.', durationMonths: 3, totalFee: 15000 },
        { name: 'Web Development', description: 'HTML, CSS, JavaScript, React, and Node.js.', durationMonths: 6, totalFee: 35000 },
        { name: 'Graphic Design', description: 'Adobe Photoshop, Illustrator, and CorelDRAW.', durationMonths: 4, totalFee: 25000 },
        { name: 'Networking', description: 'CCNA, network setup, and troubleshooting.', durationMonths: 6, totalFee: 40000 },
        { name: 'Cyber Security', description: 'Ethical hacking, security tools, and best practices.', durationMonths: 5, totalFee: 45000 },
        { name: 'Python Programming', description: 'Python basics, data science, and automation.', durationMonths: 4, totalFee: 30000 },
      ],
      computers: { mode: 'range', defaultValue: 35000, range: { start: 1, end: 30, prefix: 'PC-' }, manualList: [] },
      syncComputersToInventory: true,
      landing: {
        aboutText: 'HDM Computer School offers certified courses in programming, networking, and design.',
        gallery: [],
      },
    });
    console.log('  ✅ Settings created');
  } else {
    console.log('  ⏭️  Settings already exist');
  }

  const User = connection.model('User');
  const existingAdmin = await User.findOne({ email: 'admin@school.com' });
  if (!existingAdmin) {
    const user = new User({ name: 'School Admin', email: 'admin@school.com', password: 'admin123', role: 'admin' });
    await user.save();
    console.log('  ✅ Admin user created (admin@school.com / admin123)');
  } else {
    console.log('  ⏭️  Admin user already exists');
  }

  const BackupConfig = connection.model('BackupConfig');
  const existingBC = await BackupConfig.findOne();
  if (!existingBC) {
    await BackupConfig.create({ enabled: true, frequency: 'weekly', time: '02:00', dayOfWeek: 0, retentionDays: 30, emailEnabled: false, emailRecipients: [] });
    console.log('  ✅ Backup config created');
  } else {
    console.log('  ⏭️  Backup config already exists');
  }

  console.log('\n✅ School seed complete.\n');
};

const seedSchoolSettings = async () => {
  console.log('\n🌱 Seeding School Settings only...\n');
  const Settings = connection.model('Settings');
  const existing = await Settings.findOne();
  if (existing) {
    console.log('  Settings already exist. Update via admin panel.\n');
    return;
  }
  await seedSchoolAll();
};

// ==================== CYBER SEED ====================

const seedCyberAll = async () => {
  console.log('\n🌱 Seeding Cyber Database...\n');

  const SuperAdmin = connection.model('SuperAdmin');
  const existingSA = await SuperAdmin.findOne({ email: 'superadmin@cyber.com' });
  if (!existingSA) {
    const admin = new SuperAdmin({ name: 'Super Admin', email: 'superadmin@cyber.com', password: 'admin123', role: 'super_admin' });
    await admin.save();
    console.log('  ✅ Super admin created (superadmin@cyber.com / admin123)');
  } else {
    console.log('  ⏭️  Super admin already exists');
  }

  const Plan = connection.model('Plan');
  const existingPlans = await Plan.countDocuments();
  if (existingPlans === 0) {
    await Plan.create([
      { name: 'Monthly', type: 'monthly', price: 1500, trialDays: 14, features: ['Full access', 'Unlimited services', 'Inventory management', 'Financial reports', 'Email support'], active: true, order: 1 },
      { name: 'Yearly', type: 'yearly', price: 15000, trialDays: 14, features: ['Full access', 'Unlimited services', 'Inventory management', 'Financial reports', 'Priority support', '2 months free'], active: true, order: 2 },
    ]);
    console.log('  ✅ Plans created (Monthly KES 1,500 | Yearly KES 15,000)');
  } else {
    console.log('  ⏭️  Plans already exist');
  }

  const Legal = connection.model('Legal');
  const existingLegal = await Legal.findOne();
  if (!existingLegal) {
    await Legal.create({
      terms: 'These are the terms and conditions. Replace with your actual terms.',
      privacy: 'This is the privacy policy. Replace with your actual policy.',
      refund: 'This is the refund policy. Replace with your actual refund terms.',
    });
    console.log('  ✅ Legal pages created');
  } else {
    console.log('  ⏭️  Legal pages already exist');
  }

  console.log('\n✅ Cyber seed complete.\n');
};

const seedCyberPlans = async () => {
  console.log('\n🌱 Seeding Plans only...\n');
  const Plan = connection.model('Plan');
  await Plan.deleteMany({});
  await Plan.create([
    { name: 'Monthly', type: 'monthly', price: 1500, trialDays: 14, features: ['Full access', 'Unlimited services', 'Inventory management', 'Financial reports', 'Email support'], active: true, order: 1 },
    { name: 'Yearly', type: 'yearly', price: 15000, trialDays: 14, features: ['Full access', 'Unlimited services', 'Inventory management', 'Financial reports', 'Priority support', '2 months free'], active: true, order: 2 },
  ]);
  console.log('  ✅ Plans seeded\n');
};

const seedCyberPaymentMethods = async () => {
  console.log('\n💳 Payment methods are managed via Super Admin Settings (API).');
  console.log('  Default: STK Push = ON, Send Money = OFF, Till = OFF, Paybill = OFF\n');
};

// ==================== MAIN ====================

const main = async () => {
  console.log('\n╔══════════════════════════╗');
  console.log('║    HDM SEEDER CLI        ║');
  console.log('╚══════════════════════════╝\n');

  console.log('  1. School Database');
  console.log('  2. Cyber Database');
  const dbChoice = await question('\n  Choose DB: ');

  if (dbChoice === '1') {
    selectedDB = 'school_db';
    await connectDB(process.env.SCHOOL_MONGODB_URI, 'School DB');

    console.log('\n📋 School Seed Options:');
    console.log('  1. Seed All (Settings, Admin, Backup Config)');
    console.log('  2. Seed Settings Only');
    const choice = await question('\n  Choose: ');

    if (choice === '1') await seedSchoolAll();
    else if (choice === '2') await seedSchoolSettings();
    else console.log('\n❌ Invalid option.\n');

  } else if (dbChoice === '2') {
    selectedDB = 'cyber_db';
    await connectDB(process.env.CYBER_MONGODB_URI, 'Cyber DB');

    console.log('\n📋 Cyber Seed Options:');
    console.log('  1. Seed All (Super Admin, Plans, Legal)');
    console.log('  2. Seed Plans Only');
    console.log('  3. Seed Payment Methods (info)');
    const choice = await question('\n  Choose: ');

    if (choice === '1') await seedCyberAll();
    else if (choice === '2') await seedCyberPlans();
    else if (choice === '3') await seedCyberPaymentMethods();
    else console.log('\n❌ Invalid option.\n');

  } else {
    console.log('\n❌ Invalid choice. Exiting.\n');
  }

  await connection.close();
  console.log('👋 Done!\n');
  process.exit(0);
};

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});