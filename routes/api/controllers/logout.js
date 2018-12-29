const express = require('express');
const router = express.Router();
const passport = require('passport');

/* POST logout */
router.post('/', async (req, res, next) => {
    req.logout();
    res.jsonApi(null, {});
});

module.exports.router = router;