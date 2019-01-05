const HttpError = require('http-errors');

//
// Middleware to add a req.jsonQuery object with the following properties:
// filter: Object which is a mongoDB JSON query
// fields: Array of fields to include (empty array will include all)
// populate: Array of related subdocs to populate
//
module.exports = function (req, res, next) {
    try {
        if (req.query.json) {
            req.jsonQuery = req.query.json?JSON.parse(req.query.json || null):{};
            req.jsonQuery.filter = req.jsonQuery.filter || {};
            req.jsonQuery.fields = req.jsonQuery.fields || [];
            req.jsonQuery.populate = req.jsonQuery.populate || [];
        }
        next();
    }
    catch (err) {
        return next(HttpError(400, 'bad json query string'));
    }
}