const express = require('express');
const router = express.Router();
const api = require('./api');
const web = require('./web');

router.use('/', web);
router.use('/api', api);

module.exports = router;