// routes/cyber/admin/transactions.js

const router = require('express').Router();
const ctrl = require('../../../controllers/cyber/admin/transactionController');
const { requireCyberAdmin } = require('../../../middleware/auth');

router.get('/summary', requireCyberAdmin, ctrl.getRevenueSummary);
router.get('/tenant/:tenantId', requireCyberAdmin, ctrl.getTransactionsByTenant);
router.get('/', requireCyberAdmin, ctrl.getAllTransactions);

module.exports = router;