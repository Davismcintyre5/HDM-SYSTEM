// routes/cyber/tenant/reports.js

const router = require('express').Router();
const ctrl = require('../../../controllers/cyber/tenant/reportController');
const { requireCyberTenant } = require('../../../middleware/auth');

router.get('/dashboard', requireCyberTenant, ctrl.getDashboardStats);
router.get('/financial', requireCyberTenant, ctrl.getFinancialReports);

module.exports = router;