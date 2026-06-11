// routes/cyber/tenant/invoices.js

const router = require('express').Router();
const ctrl = require('../../../controllers/cyber/tenant/invoiceController');
const { requireCyberTenant } = require('../../../middleware/auth');

router.get('/', requireCyberTenant, ctrl.getAllInvoices);
router.get('/:id', requireCyberTenant, ctrl.getInvoiceById);
router.post('/', requireCyberTenant, ctrl.createInvoice);
router.post('/:id/send', requireCyberTenant, ctrl.sendInvoice);
router.put('/:id/pay', requireCyberTenant, ctrl.payInvoice);
router.delete('/:id', requireCyberTenant, ctrl.deleteInvoice);

module.exports = router;