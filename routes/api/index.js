const express = require('express');
const router = express.Router();
const path = require('path');
const HttpError = require('http-errors');
const RouteList = require('../../route-list');
const RouteLoader = require('../../route-loader');
const { jsonApi, jsonQuery } = require('../../json-api');

const CONTROLLER_DIR = path.resolve(__dirname, 'controllers');

let routeList = new RouteList();

// Add jsonApi handler
router.use(jsonApi);
router.use(jsonQuery);

// List routes
router.get('/', (req, res, next) => {
    res.jsonApi(null, routeList.routes);
})

// Load routes in directory
RouteLoader(router, CONTROLLER_DIR);

// Not found error
router.use(function notFound(req, res, next) {
    return next(HttpError(404, 'API route not found'));
});

router.use(function (err, req, res, next) {
    res.status(err.status || 500);
    return res.jsonApi(err);
});

routeList.use('/api', router);

console.log(`API Routes\n${routeList.list}`);

module.exports = router;