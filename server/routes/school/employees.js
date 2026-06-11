// routes/school/employees.js

const router = require('express').Router();
const ctrl = require('../../controllers/school/employeeController');
const { requireSchoolAdmin } = require('../../middleware/auth');

router.get('/:empId', requireSchoolAdmin, ctrl.getEmployeeByEmpId);
router.get('/', requireSchoolAdmin, ctrl.getAllEmployees);
router.post('/', requireSchoolAdmin, ctrl.createEmployee);
router.put('/:id', requireSchoolAdmin, ctrl.updateEmployee);
router.delete('/:id', requireSchoolAdmin, ctrl.deleteEmployee);
router.post('/:id/pay', requireSchoolAdmin, ctrl.paySalary);

module.exports = router;