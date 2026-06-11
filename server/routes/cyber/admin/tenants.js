// routes/cyber/admin/tenants.js

const router = require('express').Router();
const ctrl = require('../../../controllers/cyber/admin/tenantController');
const { requireCyberAdmin } = require('../../../middleware/auth');

router.get('/stats', requireCyberAdmin, ctrl.getTenantStats);
router.get('/:id', requireCyberAdmin, ctrl.getTenantById);
router.get('/', requireCyberAdmin, ctrl.getAllTenants);
router.put('/:id/approve', requireCyberAdmin, ctrl.approveTenant);
router.put('/:id/reject', requireCyberAdmin, ctrl.rejectTenant);
router.put('/:id/suspend', requireCyberAdmin, ctrl.suspendTenant);
router.put('/:id/activate', requireCyberAdmin, ctrl.activateTenant);
router.delete('/:id', requireCyberAdmin, ctrl.deleteTenant);

module.exports = router;