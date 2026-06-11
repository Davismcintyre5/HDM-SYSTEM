// routes/school/reports.js

const router = require('express').Router();
const ctrl = require('../../controllers/school/reportsController');
const { requireSchoolAdmin } = require('../../middleware/auth');

router.get('/dashboard', requireSchoolAdmin, ctrl.getDashboardStats);
router.get('/students', requireSchoolAdmin, ctrl.getStudentReports);
router.get('/financial', requireSchoolAdmin, ctrl.getFinancialReports);
router.get('/inventory', requireSchoolAdmin, ctrl.getInventoryReports);
router.get('/applications', requireSchoolAdmin, ctrl.getApplicationReports);
router.get('/employees', requireSchoolAdmin, ctrl.getEmployeeReports);

module.exports = router;