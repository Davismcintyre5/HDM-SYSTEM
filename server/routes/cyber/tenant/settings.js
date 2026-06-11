// routes/cyber/tenant/settings.js

const router = require('express').Router();
const ctrl = require('../../../controllers/cyber/tenant/settingsController');
const { requireCyberTenant } = require('../../../middleware/auth');

router.get('/', requireCyberTenant, ctrl.getSettings);
router.put('/', requireCyberTenant, ctrl.updateSettings);

module.exports = router;