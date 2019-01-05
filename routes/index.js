const express = require('express');
const router = express.Router();
const RouteList = require('@rbtdev/express-route-list');
const api = require('./api');
const web = require('./web');

router.use('/', web);
router.use('/api', api);
let apiRoutes = new RouteList('/api', api);
console.log(`API Routes\n${apiRoutes.list}`);

module.exports = router;