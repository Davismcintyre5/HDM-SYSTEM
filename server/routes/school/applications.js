// routes/school/applications.js

const router = require('express').Router();
const ctrl = require('../../controllers/school/applicationController');
const { requireSchoolAdmin } = require('../../middleware/auth');

router.post('/', ctrl.submitApplication);
router.get('/', requireSchoolAdmin, ctrl.getAllApplications);
router.put('/:id', requireSchoolAdmin, ctrl.updateApplicationStatus);
router.delete('/:id', requireSchoolAdmin, ctrl.deleteApplication);

module.exports = router;