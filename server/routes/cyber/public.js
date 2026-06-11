// routes/cyber/public.js

const router = require('express').Router();
const supportCtrl = require('../../controllers/cyber/admin/supportController');
const legalCtrl = require('../../controllers/cyber/admin/legalController');
const mpesaCtrl = require('../../controllers/cyber/admin/mpesaController');
const settingsCtrl = require('../../controllers/cyber/admin/settingsController');
const { requireCyberTenant } = require('../../middleware/auth');

// Support
router.post('/support', supportCtrl.submitTicket);

// Legal
router.get('/legal/:page', legalCtrl.getLegalPage);
router.get('/legal', legalCtrl.getLegalPages);

// Public Settings (payment methods, M-Pesa details)
router.get('/public-settings', settingsCtrl.getPublicSettings);

// M-Pesa
router.post('/mpesa/stkpush', requireCyberTenant, mpesaCtrl.initiateStkPush);
router.post('/mpesa/callback', mpesaCtrl.mpesaCallback);

module.exports = router;