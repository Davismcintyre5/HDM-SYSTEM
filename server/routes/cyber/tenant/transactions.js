// routes/cyber/tenant/transactions.js

const router = require('express').Router();
const ctrl = require('../../../controllers/cyber/tenant/transactionController');
const { requireCyberTenant } = require('../../../middleware/auth');

router.get('/summary', requireCyberTenant, ctrl.getTransactionSummary);
router.get('/:id', requireCyberTenant, ctrl.getTransactionById);
router.get('/', requireCyberTenant, ctrl.getAllTransactions);
router.post('/', requireCyberTenant, ctrl.createTransaction);
router.put('/:id/confirm', requireCyberTenant, ctrl.confirmTransaction);
router.delete('/:id', requireCyberTenant, ctrl.deleteTransaction);

module.exports = router;