// routes/cyber/admin/support.js

const router = require('express').Router();
const ctrl = require('../../../controllers/cyber/admin/supportController');
const { requireCyberAdmin } = require('../../../middleware/auth');

router.get('/:id', requireCyberAdmin, ctrl.getTicketById);
router.get('/', requireCyberAdmin, ctrl.getAllTickets);
router.put('/:id/reply', requireCyberAdmin, ctrl.replyToTicket);
router.put('/:id/status', requireCyberAdmin, ctrl.updateTicketStatus);

module.exports = router;