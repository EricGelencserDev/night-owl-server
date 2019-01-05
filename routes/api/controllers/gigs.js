const express = require('express');
const router = express.Router();
const { Gigs } = require('../../../models');
const { authorize, isLoggedIn } = require('../../../auth');

// Route authorization rules
let rules = {

    // Allow if user is admin
    isAdmin: (req) => {
        return req.user.isAdmin;
    }
}

// Protect all gig routes from non-logged in users
router.use(isLoggedIn);

/* GET gigs listing with query string */
router.get('/', authorize([rules.isAdmin]), async (req, res, next) => {
    try {
        let gigs = await Gigs.find(req.jsonQuery.filter, req.jsonQuery.fields);
        return res.jsonApi(null, gigs);
    }
    catch (err) {
        return next([500, err]);
    }
});

/* GET current user's gigs */
router.get('/mine', async (req, res, next) => {
    try {
        let gigs = await Gigs.findByOwner(req.user, req.jsonQuery);
        return res.jsonApi(null, gigs);
    }
    catch (err) {
        return next([500, err]);
    }
});

/* GET current members's gigs */
router.get('/member', async (req, res, next) => {
    try {
        let gigs = await Gigs.findByMember(req.user, req.jsonQuery);
        return res.jsonApi(null, gigs);
    }
    catch (err) {
        return next([500, err]);
    }
});

/* POST gig create. */
router.post('/', async (req, res, next) => {
    try {
        let gigData = req.body;
        gigData.owner = req.user;
        let gig = await Gigs.create(req.body);
        return res.jsonApi(null, gig);
    }
    catch (err) {
        if (err.name && err.name === 'ValidationError') return next([400, err]);
        else return next([500, err]);
    }
});

module.exports = router;
