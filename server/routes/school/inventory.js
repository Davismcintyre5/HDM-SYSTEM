// routes/school/inventory.js

const router = require('express').Router();
const ctrl = require('../../controllers/school/inventoryController');
const { requireSchoolAdmin } = require('../../middleware/auth');

router.get('/stats', requireSchoolAdmin, ctrl.getInventoryStats);
router.get('/type/:type', requireSchoolAdmin, ctrl.getInventoryByType);
router.get('/available-computers', requireSchoolAdmin, ctrl.getAvailableComputers);
router.get('/:id', requireSchoolAdmin, ctrl.getInventoryById);
router.get('/', requireSchoolAdmin, ctrl.getAllInventory);
router.post('/', requireSchoolAdmin, ctrl.createInventory);
router.post('/assign', requireSchoolAdmin, ctrl.assignInventory);
router.put('/:id', requireSchoolAdmin, ctrl.updateInventory);
router.post('/:id/unassign', requireSchoolAdmin, ctrl.unassignInventory);
router.delete('/:id', requireSchoolAdmin, ctrl.deleteInventory);

module.exports = router;