// controllers/school/feeController.js

const { connectSchool } = require('../../config/db');
const { env } = require('../../config/env');

let schoolConnection;
let Fee, Student, Settings, Transaction;

const getModels = async () => {
  if (!schoolConnection) schoolConnection = await connectSchool();
  if (!Fee) {
    Fee = schoolConnection.model('Fee');
    Student = schoolConnection.model('Student');
    Settings = schoolConnection.model('Settings');
    Transaction = schoolConnection.model('Transaction');
  }
  return { Fee, Student, Settings, Transaction };
};

// @desc    Get all fees
// @route   GET /api/school/fees
// @access  Private/Admin
const getAllFees = async (req, res) => {
  try {
    const { Fee } = await getModels();
    const fees = await Fee.find().sort({ date: -1 }).limit(100);
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get fees by student
// @route   GET /api/school/fees/student/:regNumber
// @access  Private/Admin
const getFeesByStudent = async (req, res) => {
  try {
    const { Fee } = await getModels();
    const fees = await Fee.find({ regNumber: req.params.regNumber }).sort({ date: -1 });
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Record payment
// @route   POST /api/school/fees
// @access  Private/Admin
const recordPayment = async (req, res) => {
  try {
    const { Fee, Student, Settings, Transaction } = await getModels();
    const { regNumber, amount } = req.body;
    if (!regNumber || !amount) return res.status(400).json({ message: 'Reg number and amount required' });

    const student = await Student.findOne({ regNumber });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const settings = await Settings.findOne();
    let totalCourseFee = 0;
    if (settings?.courses && student.course) {
      const courseData = settings.courses.find(c => c.name === student.course);
      totalCourseFee = courseData?.totalFee || 0;
    }

    const newPaid = (student.feesPaid || 0) + amount;
    const balanceAfter = totalCourseFee - newPaid;

    const fee = await Fee.create({ regNumber, studentName: student.name, amount, balanceAfter, date: new Date(), notes: 'Payment received' });
    await Transaction.create({ type: 'in', amount, description: `Fees payment - ${student.name} (${student.regNumber})`, reference: fee._id.toString(), date: new Date() });

    student.feesPaid = newPaid;
    await student.save();

    if (student.email) {
      const { sendTemplateEmail } = require('../../services/emailService');
      sendTemplateEmail('school-payment-receipt', {
        to: student.email,
        studentName: student.name,
        regNumber: student.regNumber,
        amount,
        balance: balanceAfter,
        date: new Date().toLocaleDateString(),
        schoolName: settings?.schoolName || env.APP_NAME_SCHOOL,
        system: 'school',
      }).catch(err => console.error('Payment receipt email failed:', err.message));
    }

    res.status(201).json(fee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get student fee summary
// @route   GET /api/school/fees/summary/:regNumber
// @access  Private/Admin
const getFeeSummary = async (req, res) => {
  try {
    const { Student, Fee, Settings } = await getModels();
    const student = await Student.findOne({ regNumber: req.params.regNumber });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const settings = await Settings.findOne();
    let totalCourseFee = 0;
    if (settings?.courses && student.course) {
      const courseData = settings.courses.find(c => c.name === student.course);
      totalCourseFee = courseData?.totalFee || 0;
    }

    const payments = await Fee.find({ regNumber: req.params.regNumber }).sort({ date: -1 });
    const totalPaid = student.feesPaid || 0;

    res.json({ regNumber: student.regNumber, studentName: student.name, course: student.course, totalCourseFee, totalPaid, balance: totalCourseFee - totalPaid, payments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllFees, getFeesByStudent, recordPayment, getFeeSummary };