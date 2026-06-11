const router = require('express').Router();

router.use('/auth', require('./auth'));
router.use('/students', require('./students'));
router.use('/employees', require('./employees'));
router.use('/fees', require('./fees'));
router.use('/accounts', require('./accounts'));
router.use('/inventory', require('./inventory'));
router.use('/settings', require('./settings'));
router.use('/portal', require('./portal'));
router.use('/applications', require('./applications'));
router.use('/certificates', require('./certificates'));
router.use('/reports', require('./reports'));
router.use('/backups', require('./backups'));
router.use('/', require('./public')); // Public routes

module.exports = router;