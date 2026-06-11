// routes/school/certificates.js

const router = require('express').Router();
const ctrl = require('../../controllers/school/certificateController');
const { requireSchoolAdmin } = require('../../middleware/auth');

router.get('/generate/:studentId', requireSchoolAdmin, ctrl.getNextCertificateNumber);

module.exports = router;