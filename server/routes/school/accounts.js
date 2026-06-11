// routes/school/accounts.js

const router = require('express').Router();
const ctrl = require('../../controllers/school/transactionController');
const { requireSchoolAdmin } = require('../../middleware/auth');

router.get('/transactions', requireSchoolAdmin, ctrl.getTransactions);
router.get('/summary', requireSchoolAdmin, ctrl.getSummary);
router.get('/', requireSchoolAdmin, ctrl.getBalance);
router.post('/income', requireSchoolAdmin, ctrl.addIncome);
router.post('/expense', requireSchoolAdmin, ctrl.addExpense);

module.exports = router;