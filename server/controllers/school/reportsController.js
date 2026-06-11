// controllers/school/reportsController.js

const { connectSchool } = require('../../config/db');

let schoolConnection;
let Student, Employee, Fee, Transaction, Inventory, Application;

const getModels = async () => {
  if (!schoolConnection) schoolConnection = await connectSchool();
  if (!Student) {
    Student = schoolConnection.model('Student');
    Employee = schoolConnection.model('Employee');
    Fee = schoolConnection.model('Fee');
    Transaction = schoolConnection.model('Transaction');
    Inventory = schoolConnection.model('Inventory');
    Application = schoolConnection.model('Application');
  }
  return { Student, Employee, Fee, Transaction, Inventory, Application };
};

// @desc    Get student reports
// @route   GET /api/school/reports/students
// @access  Private/Admin
const getStudentReports = async (req, res) => {
  try {
    const { Student } = await getModels();
    const total = await Student.countDocuments();
    const byCourse = await Student.aggregate([{ $group: { _id: '$course', count: { $sum: 1 }, totalFees: { $sum: '$feesPaid' } } }]);
    const byStatus = await Student.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const byGender = await Student.aggregate([{ $group: { _id: '$gender', count: { $sum: 1 } } }]);
    res.json({ total, byCourse, byStatus, byGender });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get financial reports
// @route   GET /api/school/reports/financial
// @access  Private/Admin
const getFinancialReports = async (req, res) => {
  try {
    const { Fee, Transaction } = await getModels();
    const fees = await Fee.find();
    const totalFeesCollected = fees.reduce((s, f) => s + f.amount, 0);

    const transactions = await Transaction.find();
    const totalIncome = transactions.filter(t => t.type === 'in').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'out').reduce((s, t) => s + t.amount, 0);

    const feesByMonth = await Fee.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$date' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({ totalFeesCollected, totalIncome, totalExpense, balance: totalIncome - totalExpense, feesByMonth });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get inventory reports
// @route   GET /api/school/reports/inventory
// @access  Private/Admin
const getInventoryReports = async (req, res) => {
  try {
    const { Inventory } = await getModels();
    const items = await Inventory.find();
    const totalValue = items.reduce((s, i) => s + (i.value || 0), 0);
    const byType = items.reduce((acc, i) => { acc[i.type] = (acc[i.type] || 0) + 1; return acc; }, {});
    const byStatus = items.reduce((acc, i) => { acc[i.status] = (acc[i.status] || 0) + 1; return acc; }, {});
    res.json({ totalItems: items.length, totalValue, byType, byStatus });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get application reports
// @route   GET /api/school/reports/applications
// @access  Private/Admin
const getApplicationReports = async (req, res) => {
  try {
    const { Application } = await getModels();
    const total = await Application.countDocuments();
    const byStatus = await Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const byCourse = await Application.aggregate([{ $group: { _id: '$course', count: { $sum: 1 } } }]);
    res.json({ total, byStatus, byCourse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get employee reports
// @route   GET /api/school/reports/employees
// @access  Private/Admin
const getEmployeeReports = async (req, res) => {
  try {
    const { Employee } = await getModels();
    const total = await Employee.countDocuments();
    const totalSalary = (await Employee.find()).reduce((s, e) => s + (e.salary || 0), 0);
    const byStatus = await Employee.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    res.json({ total, totalSalary, byStatus });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/school/reports/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const { Student, Employee, Fee, Transaction, Inventory, Application } = await getModels();
    const [students, employees, inventory, fees, applications, transactions] = await Promise.all([
      Student.countDocuments(),
      Employee.countDocuments(),
      Inventory.find(),
      Fee.find(),
      Application.find(),
      Transaction.find().sort({ date: -1 }).limit(10),
    ]);
    const inventoryValue = inventory.reduce((s, i) => s + (i.value || 0), 0);
    const feesCollected = fees.reduce((s, f) => s + f.amount, 0);
    const pendingApplications = applications.filter(a => a.status === 'pending').length;
    res.json({
      students,
      employees,
      inventoryValue,
      feesCollected,
      applications: applications.length,
      pendingApplications,
      recentTransactions: transactions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStudentReports, getFinancialReports, getInventoryReports, getApplicationReports, getEmployeeReports, getDashboardStats };