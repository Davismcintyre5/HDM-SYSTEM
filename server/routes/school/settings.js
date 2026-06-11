// routes/school/settings.js

const router = require('express').Router();
const ctrl = require('../../controllers/school/settingsController');
const { requireSchoolAdmin } = require('../../middleware/auth');

router.get('/', ctrl.getSettings);
router.put('/', requireSchoolAdmin, ctrl.updateSettings);
router.post('/sync-computers', requireSchoolAdmin, ctrl.syncComputers);

module.exports = router;