const express = require('express');
const router = express.Router();
const passport = require('passport');

function authenticate(req, res, next) {
    passport.authenticate('local', (err, user, isAuth) => {
        if (err) return next(err);
        if (!user) return next([404, 'user not found']);
        if (!isAuth) return next([401, 'authentication failed']);
        req.logIn(user, function (err) {
            if (err) return next(err);
            res.jsonApi(null, user);
        });
    })(req, res, next);
}

/* POST login */
router.post('/', authenticate);

module.exports = router;