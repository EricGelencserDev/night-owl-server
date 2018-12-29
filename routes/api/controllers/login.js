const express = require('express');
const router = express.Router();
const passport = require('passport');

/* POST login */
router.post('/', passport.authenticate('local'), async (req, res, next) => {
    res.jsonApi(null, req.user);
});

module.exports.router = router;