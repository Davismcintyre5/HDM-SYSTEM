// routes/cyber/tenant/inventory.js

const router = require('express').Router();
const ctrl = require('../../../controllers/cyber/tenant/inventoryController');
const { requireCyberTenant } = require('../../../middleware/auth');

router.get('/stats', requireCyberTenant, ctrl.getInventoryStats);
router.get('/:id', requireCyberTenant, ctrl.getInventoryById);
router.get('/', requireCyberTenant, ctrl.getAllInventory);
router.post('/', requireCyberTenant, ctrl.createInventory);
router.put('/:id', requireCyberTenant, ctrl.updateInventory);
router.delete('/:id', requireCyberTenant, ctrl.deleteInventory);

module.exports = router;