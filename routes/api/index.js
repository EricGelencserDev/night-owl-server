const express = require('express');
const router = express.Router();
const path = require('path');
const RouteLoader = require('../../route-loader');
const jsonApi = require('../../json-api');
const jsonQuery = require('../../json-query');

const CONTROLLER_DIR = path.resolve(__dirname, 'controllers');

// Add jsonApi handler
router.use(jsonApi);

// Add jsonFilter middleware
router.use(jsonQuery);

// Load routes in directory
RouteLoader(router, CONTROLLER_DIR);

// Not found error
router.use(function notFound(req, res, next) {
    return next([404, 'API route not found']);
});

router.use(function (err, req, res, next) {
    res.status(err.status || 500);
    return res.jsonApi(err);
});

module.exports = router;