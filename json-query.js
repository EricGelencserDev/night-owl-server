const HttpError = require('http-errors');

//
// Middleware to add a req.jsonQuery object
//
module.exports = function (req, res, next) {
    req.jsonQuery = {};
    try {
        req.jsonQuery.filter = req.query.filter?JSON.parse(req.query.filter || null):{};
        req.jsonQuery.fields = req.query.fields?JSON.parse(req.query.fields || null):[];
        req.jsonQuery.includes = req.query.includes?JSON.parse(req.query.includes || null):[];
        next();
    }
    catch (err) {
        return next(HttpError(400, 'bad json query string'));
    }
}