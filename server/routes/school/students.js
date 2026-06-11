// routes/school/students.js

const router = require('express').Router();
const ctrl = require('../../controllers/school/studentController');
const { requireSchoolAdmin } = require('../../middleware/auth');

router.get('/stats', requireSchoolAdmin, ctrl.getStudentStats);
router.get('/course/:course', requireSchoolAdmin, ctrl.getStudentsByCourse);
router.get('/reg/:regNumber', requireSchoolAdmin, ctrl.getStudentByReg);
router.get('/:id', requireSchoolAdmin, ctrl.getStudentById);
router.get('/', requireSchoolAdmin, ctrl.getAllStudents);
router.post('/', requireSchoolAdmin, ctrl.createStudent);
router.put('/:id', requireSchoolAdmin, ctrl.updateStudent);
router.delete('/:id', requireSchoolAdmin, ctrl.deleteStudent);

module.exports = router;