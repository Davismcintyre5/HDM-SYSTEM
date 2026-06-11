// routes/cyber/admin/backups.js

const router = require('express').Router();
const ctrl = require('../../../controllers/cyber/admin/backupController');
const { requireCyberAdmin, requireCyberAdminQuery } = require('../../../middleware/auth');

router.get('/config', requireCyberAdmin, ctrl.getBackupConfig);
router.put('/config', requireCyberAdmin, ctrl.updateBackupConfig);
router.get('/stats', requireCyberAdmin, ctrl.getBackupStats);
router.get('/tenant/:tenantId', requireCyberAdmin, ctrl.getBackupsByTenant);
router.get('/:id/download', requireCyberAdminQuery, ctrl.downloadBackupFile);
router.get('/', requireCyberAdmin, ctrl.getAllBackups);
router.post('/', requireCyberAdmin, ctrl.createBackupNow);
router.post('/:id/email', requireCyberAdmin, ctrl.emailBackup);
router.delete('/:id', requireCyberAdmin, ctrl.deleteBackupById);

module.exports = router;