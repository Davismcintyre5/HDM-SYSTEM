// routes/cyber/tenant/services.js

const router = require('express').Router();
const ctrl = require('../../../controllers/cyber/tenant/serviceController');
const { requireCyberTenant } = require('../../../middleware/auth');

router.get('/', requireCyberTenant, ctrl.getAllServices);
router.get('/:id', requireCyberTenant, ctrl.getServiceById);
router.post('/', requireCyberTenant, ctrl.createService);
router.put('/:id', requireCyberTenant, ctrl.updateService);
router.delete('/:id', requireCyberTenant, ctrl.deleteService);

module.exports = router;