// routes/index.js

const router = require('express').Router();

router.use('/school', require('./school'));
router.use('/cyber', require('./cyber'));

router.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

module.exports = router;