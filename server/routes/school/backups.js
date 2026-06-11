// routes/school/backups.js

const router = require('express').Router();
const ctrl = require('../../controllers/school/backupController');
const { requireSchoolAdmin } = require('../../middleware/auth');

router.get('/config', requireSchoolAdmin, ctrl.getBackupConfig);
router.put('/config', requireSchoolAdmin, ctrl.updateBackupConfig);
router.get('/', requireSchoolAdmin, ctrl.getAllBackups);
router.post('/', requireSchoolAdmin, ctrl.createBackupNow);
router.delete('/:id', requireSchoolAdmin, ctrl.deleteBackupById);
router.get('/:id/download', requireSchoolAdmin, ctrl.downloadBackupFile);
router.post('/:id/email', requireSchoolAdmin, ctrl.emailBackup);

module.exports = router;