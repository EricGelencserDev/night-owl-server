const express = require('express');
const HttpError = require('http-errors');
const router = express.Router();




/* GET gigs listing with query string */
router.get('/', authorize([rules.isAdmin, rules.isSelf]), async (req, res, next) => {
  try {
    let gigs = await Gigs.find(req.jsonQuery.filter, req.jsonQuery.fields);
    return res.jsonApi(null, gigs);
  }
  catch (err) {
    return next(HttpError(500, err));
  }
});

/* GET current gig */
router.get('/me', async (req, res, next) => {
  try {
    let query = { email: req.gig.email }
    let gig = await Gigs.findOne(query);
    return res.jsonApi(null, gig);
  }
  catch (err) {
    return next(HttpError(500, err));
  }
});

/* GET gig by email */
router.get('/:email', authorize([rules.isAdmin, rules.isSelf]), async (req, res, next) => {
  try {
    let query = { email: req.params.email }
    let gig = await Gigs.findOne(query);
    return res.jsonApi(null, gig);
  }
  catch (err) {
    return next(HttpError(500, err));
  }
});

/* POST gig create. */
router.post('/', authorize([rules.isAdmin]), async (req, res, next) => {
  try {
    let { gig, isNew } = await Gigs.findOrCreateByEmail(req.body);
    if (isNew) return res.jsonApi(null, gig);
    else return next(HttpError(409, "gig already exists"));
  }
  catch (err) {
    if (err.name && err.name === 'ValidationError') return next(HttpError(400, err));
    else return next(HttpError(500, err));
  }
});

/* PUT gig update (by email) */
router.put('/:email', authorize([rules.isAdmin, rules.isSelf]), async (req, res, next) => {
  let gigEmail = req.params.email;
  let gigData = req.body;

  try {
    let gig = await Gigs.findOne({ email: gigEmail });
    if (!gig) return next(HttpError(404, 'gig not found'));
    if (gig.role !== gigData.role && !req.gig.isAdmin ) return next(HttpError(401, 'cannot change role'))
    gig = await gig.updateValues(gigData);
    return res.jsonApi(null, gig);
  }
  catch (err) {
    if (err.name && err.name === 'ValidationError') return next(HttpError(400, err.message || 'validation error'));
    else return next(HttpError(500, err));
  }
});

module.exports = router;
