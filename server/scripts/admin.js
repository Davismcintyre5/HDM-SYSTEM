require('../dnsSet');

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
let selectedName = '';

const connectDB = async (dbUri, dbName) => {
  if (connection) await connection.close();
  connection = await mongoose.createConnection(dbUri);
  console.log(`\n✅ Connected to ${dbName}\n`);
  return connection;
};

const listAdmins = async () => {
  const colName = selectedDB === 'school_db' ? 'users' : 'superadmins';
  const col = connection.db.collection(colName);
  const docs = await col.find({}).toArray();
  if (docs.length === 0) return console.log('\n📭 No admins found.\n');
  console.log(`\n👥 ${colName} (${docs.length}):\n`);
  docs.forEach((doc, i) => console.log(`  ${i + 1}. ${doc.name || doc.email || doc._id} | Role: ${doc.role || 'N/A'} | Active: ${doc.active !== false}`));
  console.log('');
};

const createAdmin = async () => {
  const colName = selectedDB === 'school_db' ? 'users' : 'superadmins';
  const col = connection.db.collection(colName);
  const email = await question('  Email: ');
  const password = await question('  Password: ');
  const docName = await question('  Name: ');
  const role = selectedDB === 'school_db' ? await question('  Role (admin/staff): ') : 'super_admin';
  const hashed = await bcrypt.hash(password, 10);
  await col.insertOne({ name: docName, email, password: hashed, role: role || 'staff', active: true, createdAt: new Date(), updatedAt: new Date() });
  console.log('\n✅ Admin created.\n');
};

const manageAdmins = async () => {
  const colName = selectedDB === 'school_db' ? 'users' : 'superadmins';
  const col = connection.db.collection(colName);

  while (true) {
    console.log(`\n👤 Managing: ${colName}`);
    console.log('  1. List');
    console.log('  2. Update');
    console.log('  3. Back');
    const choice = await question('\n  Choose: ');

    if (choice === '1') {
      const docs = await col.find({}).toArray();
      if (docs.length === 0) { console.log('\n📭 No admins.\n'); continue; }
      docs.forEach((d, i) => console.log(`  ${i + 1}. ${d.name || d.email} (${d._id})`));
    } else if (choice === '2') {
      const docs = await col.find({}).toArray();
      docs.forEach((d, i) => console.log(`  ${i + 1}. ${d.name || d.email} (${d._id})`));
      const idx = parseInt(await question('  Choose #: ')) - 1;
      if (!docs[idx]) { console.log('\n❌ Invalid.\n'); continue; }
      const field = await question('  Field (name/email/role/active): ');
      const value = await question('  New value: ');
      const update = {};
      update[field] = field === 'active' ? value === 'true' : value;
      await col.updateOne({ _id: docs[idx]._id }, { $set: { ...update, updatedAt: new Date() } });
      console.log('\n✅ Updated.\n');
    } else if (choice === '3') break;
  }
};

const deleteAdmin = async () => {
  const colName = selectedDB === 'school_db' ? 'users' : 'superadmins';
  const col = connection.db.collection(colName);
  const docs = await col.find({}).toArray();
  if (docs.length === 0) return console.log('\n📭 No admins.\n');
  docs.forEach((d, i) => console.log(`  ${i + 1}. ${d.name || d.email} (${d._id})`));
  const idx = parseInt(await question('  Choose # to delete: ')) - 1;
  if (!docs[idx]) return console.log('\n❌ Invalid.\n');
  const confirm = await question(`  Delete "${docs[idx].name || docs[idx].email}"? (yes/no): `);
  if (confirm.toLowerCase() === 'yes') {
    await col.deleteOne({ _id: docs[idx]._id });
    console.log('\n✅ Deleted.\n');
  }
};

const listCollections = async () => {
  const collections = await connection.db.listCollections().toArray();
  if (collections.length === 0) return console.log('\n📭 No collections.\n');
  console.log(`\n📂 ${selectedDB}:\n`);
  collections.forEach((c, i) => console.log(`  ${i + 1}. ${c.name}`));
  console.log('');
};

const dropCollection = async () => {
  const collections = await connection.db.listCollections().toArray();
  if (collections.length === 0) return console.log('\n📭 No collections.\n');
  collections.forEach((c, i) => console.log(`  ${i + 1}. ${c.name}`));
  const name = await question('\n  Collection to DROP: ');
  const exists = collections.find((c) => c.name === name);
  if (!exists) return console.log(`\n❌ Not found.\n`);
  const confirm = await question(`\n⚠️  DROP "${name}"? (yes/no): `);
  if (confirm.toLowerCase() === 'yes') {
    await connection.db.dropCollection(name);
    console.log(`\n✅ Dropped.\n`);
  }
};

const dropDatabase = async () => {
  const confirm1 = await question(`\n⚠️  DROP "${selectedDB}"? Type DB name to confirm: `);
  if (confirm1 !== selectedDB) return console.log('\n❌ Aborted.\n');
  const confirm2 = await question(`⚠️  FINAL: Type "DELETE" to proceed: `);
  if (confirm2 === 'DELETE') {
    await connection.db.dropDatabase();
    console.log(`\n✅ Dropped.\n`);
    process.exit(0);
  }
  console.log('\n❌ Aborted.\n');
};

const switchDB = async () => {
  await connection.close();
  connection = null;
  selectedDB = '';
  selectedName = '';
  return main();
};

const main = async () => {
  console.log('\n╔══════════════════════════╗');
  console.log('║   HDM ADMIN PANEL CLI   ║');
  console.log('╚══════════════════════════╝\n');

  if (!selectedDB) {
    console.log('  1. School');
    console.log('  2. Cyber');
    const choice = await question('\n  Choose DB: ');
    if (choice === '1') {
      selectedDB = 'school_db';
      selectedName = 'School';
      await connectDB(process.env.SCHOOL_MONGODB_URI, 'School DB');
    } else if (choice === '2') {
      selectedDB = 'cyber_db';
      selectedName = 'Cyber';
      await connectDB(process.env.CYBER_MONGODB_URI, 'Cyber DB');
    } else {
      console.log('\n❌ Invalid. Exiting.\n');
      process.exit(0);
    }
  }

  while (true) {
    console.log(`\n📋 ${selectedName} Menu:`);
    console.log('  1. List Admins');
    console.log('  2. Create Admin');
    console.log('  3. Manage Admin');
    console.log('  4. Delete Admin');
    console.log('  5. List Collections');
    console.log('  6. Drop Collection');
    console.log('  7. Drop Database');
    console.log('  8. Switch Database');
    console.log('  9. Exit');

    const choice = await question('\n  Choose: ');

    if (choice === '1') await listAdmins();
    else if (choice === '2') await createAdmin();
    else if (choice === '3') await manageAdmins();
    else if (choice === '4') await deleteAdmin();
    else if (choice === '5') await listCollections();
    else if (choice === '6') await dropCollection();
    else if (choice === '7') await dropDatabase();
    else if (choice === '8') await switchDB();
    else if (choice === '9') break;
    else console.log('\n❌ Invalid option.\n');
  }

  await connection.close();
  console.log('\n👋 Goodbye!\n');
  process.exit(0);
};

main().catch((err) => { console.error('Fatal error:', err); process.exit(1); });