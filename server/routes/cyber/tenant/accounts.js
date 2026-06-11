// routes/cyber/tenant/accounts.js

const router = require('express').Router();
const ctrl = require('../../../controllers/cyber/tenant/accountController');
const { requireCyberTenant } = require('../../../middleware/auth');

router.get('/summary', requireCyberTenant, ctrl.getSummary);
router.get('/:id', requireCyberTenant, ctrl.getAccountById);
router.get('/', requireCyberTenant, ctrl.getAllAccounts);
router.post('/income', requireCyberTenant, ctrl.addIncome);
router.post('/expense', requireCyberTenant, ctrl.addExpense);
router.delete('/:id', requireCyberTenant, ctrl.deleteAccount);

module.exports = router;