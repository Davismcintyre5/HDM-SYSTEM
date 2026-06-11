// controllers/school/employeeController.js

const { connectSchool } = require('../../config/db');
const { generateEmpId } = require('../../utils/empId');

let schoolConnection;
let Employee, Transaction;

const getModels = async () => {
  if (!schoolConnection) schoolConnection = await connectSchool();
  if (!Employee) {
    Employee = schoolConnection.model('Employee');
    Transaction = schoolConnection.model('Transaction');
  }
  return { Employee, Transaction };
};

// @desc    Get all employees
// @route   GET /api/school/employees
// @access  Private/Admin
const getAllEmployees = async (req, res) => {
  try {
    const { Employee } = await getModels();
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get employee by empId
// @route   GET /api/school/employees/:empId
// @access  Private/Admin
const getEmployeeByEmpId = async (req, res) => {
  try {
    const { Employee } = await getModels();
    const employee = await Employee.findOne({ empId: req.params.empId });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create employee
// @route   POST /api/school/employees
// @access  Private/Admin
const createEmployee = async (req, res) => {
  try {
    const { Employee } = await getModels();
    const empId = await generateEmpId(Employee);
    const employee = new Employee({ ...req.body, empId });
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update employee
// @route   PUT /api/school/employees/:id
// @access  Private/Admin
const updateEmployee = async (req, res) => {
  try {
    const { Employee } = await getModels();
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete employee
// @route   DELETE /api/school/employees/:id
// @access  Private/Admin
const deleteEmployee = async (req, res) => {
  try {
    const { Employee } = await getModels();
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Pay salary
// @route   POST /api/school/employees/:id/pay
// @access  Private/Admin
const paySalary = async (req, res) => {
  try {
    const { Employee, Transaction } = await getModels();
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    await Transaction.create({
      type: 'out',
      amount: employee.salary,
      description: `Salary paid to ${employee.name} (${employee.empId})`,
      date: new Date(),
    });
    res.json({ message: `Salary of KES ${employee.salary.toLocaleString()} paid to ${employee.name}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllEmployees, getEmployeeByEmpId, createEmployee, updateEmployee, deleteEmployee, paySalary };