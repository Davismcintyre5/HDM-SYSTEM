// routes/cyber/admin/auth.js

const router = require('express').Router();
const ctrl = require('../../../controllers/cyber/admin/authController');
const { requireCyberAdmin } = require('../../../middleware/auth');

router.post('/login', ctrl.login);
router.post('/refresh', ctrl.refreshToken);
router.put('/change-password', requireCyberAdmin, ctrl.changePassword);
router.post('/verify-access', ctrl.verifyAccess);

module.exports = router;