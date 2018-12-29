const express = require('express');
const router = express.Router();
const path = require('path');
const httpError = require('http-errors');
const { requireDir } = require('../../utils');
const { isLoggedIn } = require('./../../auth');

//
// Middleware to set up custom jsonApi response handling
//
function jsonApi(req, res, next) {

    // New res function to send a JSON api object back as a response
    function _jsonApi(err, data) {
        let resp = null;
        if (err) {
            // set response status to specific status or 500
            res.status(err.status || 500);

            // Wrap error in response object
            resp = {
                error: {
                    message: err.error || err.message,
                    stack: req.app.get('env') === 'development' ? err.stack : undefined
                }
            };
            console.error(`API error ${JSON.stringify(resp, null, 2)}`);
        } else {
            // wrap data in response object
            resp = { data: data }
        }
        // use original res.json to send response
        return _json(resp);
    }

    // Save original res.json function for later use
    let _json = res.json.bind(res);

    // Attach the jsonApi function to the response object
    res.jsonApi = _jsonApi;

    // Override res.json and send error if used
    res.json = () => res.jsonApi(new Error("Must use 'res.jsonApi(err, data)' to send a response"));

    // next middleware
    next();
}

// Add jsonApi handler
router.use(jsonApi);

// Load routes
const CONTROLLER_DIR = 'controllers'
const REQUIRE_PATH = path.resolve(__dirname, CONTROLLER_DIR);
const ROUTES = requireDir(REQUIRE_PATH);

ROUTES.forEach(route => {
    // get the router from the exports object
    let _router = route.exports.router;
    // get route path by using the filename (without the extension)
    let routePath = `/${path.basename(route.filename, '.js')}`
    // Add sub-router to route paths
    // if the route is "private" use isLoggedIn in the middleware
    if (route.exports.isPrivate) router.use(routePath, isLoggedIn, _router);
    else router.use(routePath, _router);
});

// Not found error
router.use(function notFound(req, res, next) {
    return res.jsonApi(httpError(404, 'API route not found'));
});

module.exports = router;