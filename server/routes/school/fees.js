// routes/school/fees.js

const router = require('express').Router();
const ctrl = require('../../controllers/school/feeController');
const { requireSchoolAdmin } = require('../../middleware/auth');

router.get('/summary/:regNumber', requireSchoolAdmin, ctrl.getFeeSummary);
router.get('/student/:regNumber', requireSchoolAdmin, ctrl.getFeesByStudent);
router.get('/', requireSchoolAdmin, ctrl.getAllFees);
router.post('/', requireSchoolAdmin, ctrl.recordPayment);

module.exports = router;