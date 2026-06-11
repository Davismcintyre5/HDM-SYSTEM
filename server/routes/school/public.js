// routes/school/public.js

const router = require('express').Router();
const settingsCtrl = require('../../controllers/school/settingsController');
const applicationCtrl = require('../../controllers/school/applicationController');
const portalCtrl = require('../../controllers/school/portalController');

// Settings — public read
router.get('/settings', settingsCtrl.getSettings);

// Applications — public submit
router.post('/applications', applicationCtrl.submitApplication);

// Portal — public register/login
router.post('/portal/register', portalCtrl.register);
router.post('/portal/login', portalCtrl.login);

module.exports = router;