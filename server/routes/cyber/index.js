// routes/cyber/index.js

const router = require('express').Router();

router.use('/tenant/auth', require('./tenant/auth'));
router.use('/tenant/services', require('./tenant/services'));
router.use('/tenant/accounts', require('./tenant/accounts'));
router.use('/tenant/inventory', require('./tenant/inventory'));
router.use('/tenant/transactions', require('./tenant/transactions'));
router.use('/tenant/reports', require('./tenant/reports'));
router.use('/tenant/settings', require('./tenant/settings'));
router.use('/tenant/backups', require('./tenant/backups'));
router.use('/admin/auth', require('./admin/auth'));
router.use('/admin/tenants', require('./admin/tenants'));
router.use('/admin/plans', require('./admin/plans'));
router.use('/admin/transactions', require('./admin/transactions'));
router.use('/admin/settings', require('./admin/settings'));
router.use('/admin/support', require('./admin/support'));
router.use('/admin/backups', require('./admin/backups'));
router.use('/admin/legal', require('./admin/legal'));
router.use('/', require('./public'));
router.use('/tenant/invoices', require('./tenant/invoices'));

module.exports = router;