const HttpError = require('http-errors');

//
// Middleware to add a req.jsonQuery.filter object
//
module.exports.jsonIncludes = function (req, res, next) {
    req.jsonQuery = req.jsonQuery || {};
    try {
        req.jsonQuery.includes = req.query.includes?JSON.parse(req.query.includes || null):[];
        next();
    }
    catch (err) {
        return next(HttpError(400, 'bad json query object'));
    }
}

//
// Middleware to add a req.jsonQuery.filter object
//
module.exports.jsonFilter = function (req, res, next) {
    req.jsonQuery = req.jsonQuery || {};
    try {
        req.jsonQuery.filter = req.query.filter?JSON.parse(req.query.filter || null):{};
        next();
    }
    catch (err) {
        return next(HttpError(400, 'bad json query object'));
    }
}
//
// Middleware to add a req.jsonQuery.fields object
//
module.exports.jsonFields = function (req, res, next) {
    req.jsonQuery = req.jsonQuery || {};
    try {
        req.jsonQuery.fields = req.query.fields?JSON.parse(req.query.fields || null):[];
        next();
    }
    catch (err) {
        return next(HttpError(400, 'bad json query object'));
    }
}
//
// Middleware to set up custom jsonApi response handling
//
module.exports.jsonApi = function (req, res, next) {

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
    res.json = () => next(new Error("Must use 'res.jsonApi(err, data)' to send a response"));

    // next middleware
    next();
}

