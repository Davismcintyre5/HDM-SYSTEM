// routes/cyber/tenant/backups.js

const router = require('express').Router();
const ctrl = require('../../../controllers/cyber/tenant/backupController');
const { requireCyberTenant, requireCyberTenantQuery } = require('../../../middleware/auth');

router.get('/', requireCyberTenant, ctrl.getAllBackups);
router.post('/', requireCyberTenant, ctrl.createBackupNow);
router.delete('/:id', requireCyberTenant, ctrl.deleteBackupById);
router.get('/:id/download', requireCyberTenantQuery, ctrl.downloadBackupFile);
router.post('/:id/email', requireCyberTenant, ctrl.emailBackup);

module.exports = router;