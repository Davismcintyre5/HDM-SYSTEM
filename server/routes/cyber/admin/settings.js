// routes/cyber/admin/settings.js

const router = require('express').Router();
const ctrl = require('../../../controllers/cyber/admin/settingsController');
const { requireCyberAdmin } = require('../../../middleware/auth');

router.get('/', requireCyberAdmin, ctrl.getSettings);
router.put('/', requireCyberAdmin, ctrl.updateSettings);

module.exports = router;