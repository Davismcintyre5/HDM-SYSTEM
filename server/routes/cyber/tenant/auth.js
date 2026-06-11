// routes/cyber/tenant/auth.js

const router = require('express').Router();
const ctrl = require('../../../controllers/cyber/tenant/authController');
const { requireCyberTenant } = require('../../../middleware/auth');

router.post('/register', ctrl.register);
router.post('/register-paid', ctrl.registerPaid);
router.post('/login', ctrl.login);
router.post('/refresh', ctrl.refreshToken);
router.get('/profile', requireCyberTenant, ctrl.getProfile);
router.put('/profile', requireCyberTenant, ctrl.updateProfile);
router.put('/change-password', requireCyberTenant, ctrl.changePassword);

module.exports = router;