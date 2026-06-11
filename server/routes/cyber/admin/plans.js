// routes/cyber/admin/plans.js

const router = require('express').Router();
const ctrl = require('../../../controllers/cyber/admin/subscriptionController');
const { requireCyberAdmin } = require('../../../middleware/auth');

router.get('/all', requireCyberAdmin, ctrl.getAllPlansAdmin);
router.get('/:id', requireCyberAdmin, ctrl.getPlanById);
router.get('/', ctrl.getAllPlans);
router.post('/', requireCyberAdmin, ctrl.createPlan);
router.put('/:id', requireCyberAdmin, ctrl.updatePlan);
router.delete('/:id', requireCyberAdmin, ctrl.deletePlan);

module.exports = router;