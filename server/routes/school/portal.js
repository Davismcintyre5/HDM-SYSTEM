// routes/school/portal.js

const router = require('express').Router();
const ctrl = require('../../controllers/school/portalController');
const { requireSchoolPortal, requireSchoolAdmin } = require('../../middleware/auth');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/refresh', ctrl.refreshToken);
router.get('/profile', requireSchoolPortal, ctrl.getProfile);
router.put('/profile', requireSchoolPortal, ctrl.updateProfile);
router.put('/change-password', requireSchoolPortal, ctrl.changePassword);
router.put('/deactivate', requireSchoolPortal, ctrl.deactivateAccount);
router.get('/users', requireSchoolAdmin, ctrl.getAllPortalUsers);
router.get('/users/:id', requireSchoolAdmin, ctrl.getPortalUserById);
router.put('/users/:id', requireSchoolAdmin, ctrl.updatePortalUser);
router.delete('/users/:id', requireSchoolAdmin, ctrl.deletePortalUser);
router.put('/users/:id/toggle', requireSchoolAdmin, ctrl.togglePortalUserStatus);
router.put('/users/:id/reset-password', requireSchoolAdmin, ctrl.resetPortalUserPassword);

module.exports = router;