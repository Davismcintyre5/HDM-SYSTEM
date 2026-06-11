// routes/cyber/admin/legal.js

const router = require('express').Router();
const ctrl = require('../../../controllers/cyber/admin/legalController');
const { requireCyberAdmin } = require('../../../middleware/auth');

router.get('/', requireCyberAdmin, ctrl.getLegalPagesAdmin);
router.put('/', requireCyberAdmin, ctrl.updateLegalPages);

module.exports = router;