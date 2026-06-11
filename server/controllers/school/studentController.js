// controllers/school/studentController.js

const { connectSchool } = require('../../config/db');
const { generateRegNumber } = require('../../utils/regNumber');

let schoolConnection;
let Student, Inventory, Fee, Settings, Transaction;

const getModels = async () => {
  if (!schoolConnection) schoolConnection = await connectSchool();
  if (!Student) {
    Student = schoolConnection.model('Student');
    Inventory = schoolConnection.model('Inventory');
    Fee = schoolConnection.model('Fee');
    Settings = schoolConnection.model('Settings');
    Transaction = schoolConnection.model('Transaction');
  }
  return { Student, Inventory, Fee, Settings, Transaction };
};

// @desc    Get all students
// @route   GET /api/school/students
// @access  Private/Admin
const getAllStudents = async (req, res) => {
  try {
    const { Student } = await getModels();
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student by ID
// @route   GET /api/school/students/:id
// @access  Private/Admin
const getStudentById = async (req, res) => {
  try {
    const { Student } = await getModels();
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student by registration number
// @route   GET /api/school/students/reg/:regNumber
// @access  Private/Admin
const getStudentByReg = async (req, res) => {
  try {
    const { Student } = await getModels();
    const student = await Student.findOne({ regNumber: req.params.regNumber });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create student
// @route   POST /api/school/students
// @access  Private/Admin
const createStudent = async (req, res) => {
  try {
    const { Student, Inventory, Fee, Settings, Transaction } = await getModels();
    const { computerAssigned, feesPaid, course, age, idNumber, enrollmentDate, completionDate, ...studentData } = req.body;

    if (!studentData.regNumber) studentData.regNumber = await generateRegNumber(Student);

    const settings = await Settings.findOne();
    let totalCourseFee = 0;
    if (settings?.courses) {
      const courseData = settings.courses.find(c => c.name === course);
      totalCourseFee = courseData?.totalFee || 0;
    }

    const student = new Student({
      ...studentData,
      course,
      age: age ? parseInt(age) : undefined,
      idNumber,
      enrollmentDate: enrollmentDate || new Date(),
      completionDate,
      feesPaid: parseFloat(feesPaid) || 0,
      computerAssigned,
    });
    await student.save();

    if (computerAssigned) {
      const computer = await Inventory.findOne({ name: computerAssigned, type: 'Computer' });
      if (computer) {
        computer.status = 'Assigned';
        computer.assignedTo = student._id;
        computer.assignedModel = 'Student';
        await computer.save();
      }
    }

    const paid = parseFloat(feesPaid) || 0;
    if (paid > 0) {
      const balanceAfter = totalCourseFee - paid;
      await Fee.create({
        regNumber: student.regNumber,
        studentName: student.name,
        amount: paid,
        balanceAfter,
        date: new Date(),
        notes: 'Initial enrollment payment',
      });
      await Transaction.create({
        type: 'in',
        amount: paid,
        description: `Initial fees - ${student.name} (${student.regNumber}) - ${course}`,
        reference: student.regNumber,
        date: new Date(),
      });
    }

    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update student
// @route   PUT /api/school/students/:id
// @access  Private/Admin
const updateStudent = async (req, res) => {
  try {
    const { Student, Inventory } = await getModels();
    const { computerAssigned, age, idNumber, enrollmentDate, completionDate, feesPaid, ...updateData } = req.body;
    const oldStudent = await Student.findById(req.params.id);
    if (!oldStudent) return res.status(404).json({ message: 'Student not found' });

    if (computerAssigned !== oldStudent.computerAssigned) {
      if (oldStudent.computerAssigned) {
        const oldComputer = await Inventory.findOne({ name: oldStudent.computerAssigned });
        if (oldComputer) { oldComputer.status = 'Available'; oldComputer.assignedTo = null; oldComputer.assignedModel = null; await oldComputer.save(); }
      }
      if (computerAssigned) {
        const newComputer = await Inventory.findOne({ name: computerAssigned });
        if (newComputer) { newComputer.status = 'Assigned'; newComputer.assignedTo = req.params.id; newComputer.assignedModel = 'Student'; await newComputer.save(); }
      }
    }

    const updateFields = {
      ...updateData,
      ...(age !== undefined && { age: parseInt(age) }),
      ...(idNumber !== undefined && { idNumber }),
      ...(enrollmentDate !== undefined && { enrollmentDate }),
      ...(completionDate !== undefined && { completionDate }),
      ...(feesPaid !== undefined && { feesPaid: parseFloat(feesPaid) }),
      computerAssigned,
    };

    const student = await Student.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete student
// @route   DELETE /api/school/students/:id
// @access  Private/Admin
const deleteStudent = async (req, res) => {
  try {
    const { Student, Inventory, Fee, Transaction } = await getModels();
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (student.computerAssigned) {
      const computer = await Inventory.findOne({ name: student.computerAssigned });
      if (computer) { computer.status = 'Available'; computer.assignedTo = null; computer.assignedModel = null; await computer.save(); }
    }

    await Fee.deleteMany({ regNumber: student.regNumber });
    await Transaction.deleteMany({ reference: student.regNumber });
    await student.deleteOne();
    res.json({ message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get students by course
// @route   GET /api/school/students/course/:course
// @access  Private/Admin
const getStudentsByCourse = async (req, res) => {
  try {
    const { Student } = await getModels();
    const students = await Student.find({ course: req.params.course }).sort({ name: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student statistics
// @route   GET /api/school/students/stats
// @access  Private/Admin
const getStudentStats = async (req, res) => {
  try {
    const { Student } = await getModels();
    const total = await Student.countDocuments();
    const byGender = await Student.aggregate([{ $group: { _id: '$gender', count: { $sum: 1 } } }]);
    const byCourse = await Student.aggregate([{ $group: { _id: '$course', count: { $sum: 1 } } }]);
    res.json({ total, byGender, byCourse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllStudents, getStudentById, getStudentByReg, createStudent, updateStudent, deleteStudent, getStudentsByCourse, getStudentStats };