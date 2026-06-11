// controllers/school/certificateController.js

const { connectSchool } = require('../../config/db');
const { env } = require('../../config/env');

let schoolConnection;
let CertificateCounter, Student, Settings;

const getModels = async () => {
  if (!schoolConnection) schoolConnection = await connectSchool();
  if (!CertificateCounter) {
    CertificateCounter = schoolConnection.model('CertificateCounter');
    Student = schoolConnection.model('Student');
    Settings = schoolConnection.model('Settings');
  }
  return { CertificateCounter, Student, Settings };
};

// @desc    Get/generate certificate number
// @route   GET /api/school/certificates/generate/:studentId
// @access  Private/Admin
const getNextCertificateNumber = async (req, res) => {
  try {
    const { CertificateCounter, Student, Settings } = await getModels();
    const student = await Student.findById(req.params.studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    if (student.certificateNumber) return res.json({ serialNumber: student.certificateNumber });

    const currentYear = new Date().getFullYear();
    let counter = await CertificateCounter.findOne({ year: currentYear });
    if (!counter) counter = new CertificateCounter({ year: currentYear, lastNumber: 0 });
    const nextNumber = counter.lastNumber + 1;
    counter.lastNumber = nextNumber;
    await counter.save();

    const serialNumber = `CERT${currentYear}${nextNumber.toString().padStart(3, '0')}`;
    student.certificateNumber = serialNumber;
    await student.save();

    if (student.email) {
      const settings = await Settings.findOne();
      const { sendTemplateEmail } = require('../../services/emailService');
      sendTemplateEmail('school-certificate-ready', {
        to: student.email,
        name: student.name,
        certificateNumber: serialNumber,
        schoolName: settings?.schoolName || env.APP_NAME_SCHOOL,
        system: 'school',
      }).catch(err => console.error('Certificate email failed:', err.message));
    }

    res.json({ serialNumber });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getNextCertificateNumber };