// routes/school/auth.js

const router = require('express').Router();
const ctrl = require('../../controllers/school/authController');
const { requireSchoolAdmin } = require('../../middleware/auth');

router.post('/login', ctrl.login);
router.post('/refresh', ctrl.refreshToken);
router.post('/register', requireSchoolAdmin, ctrl.register);
router.put('/change-password', requireSchoolAdmin, ctrl.changePassword);
router.get('/users', requireSchoolAdmin, ctrl.getAllUsers);
router.get('/users/:id', requireSchoolAdmin, ctrl.getUserById);
router.put('/users/:id/role', requireSchoolAdmin, ctrl.updateUserRole);
router.delete('/users/:id', requireSchoolAdmin, ctrl.deleteUser);

module.exports = router;