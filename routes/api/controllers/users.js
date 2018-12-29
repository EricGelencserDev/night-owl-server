const express = require('express');
const httpError = require('http-errors');
const router = express.Router();
const { Users } = require('../../../models');
const { authorize } = require('../../../auth');

/* GET users listing with query string */
router.get('/', authorize(['admin']), async (req, res, next) => {
  try {
    let query = JSON.parse(req.query.q || null);
    let users = await Users.find(query);
    return res.jsonApi(null, users);
  }
  catch (err) {
    return res.jsonApi(httpError(500, err));
  }
});

/* GET current user */
router.get('/me', async (req, res, next) => {
  try {
    let query = { email: req.user.email }
    let user = await Users.findOne(query);
    return res.jsonApi(null, user);
  }
  catch (err) {
    return res.jsonApi(httpError(500, err));
  }
});

/* GET user by email */
router.get('/:email', authorize(['admin', 'self:email']), async (req, res, next) => {
  try {
    let query = { email: req.params.email }
    let user = await Users.findOne(query);
    return res.jsonApi(null, user);
  }
  catch (err) {
    return res.jsonApi(httpError(500, err));
  }
});

/* PUT user update (by email) */
router.put('/:email', authorize(['admin', 'self:email']), async (req, res, next) => {
  let userEmail = req.params.email;
  let userData = req.body;
  try {
    let user = await Users.findOne({ email: userEmail });
    if (!user) return res.jsonApi(httpError(404, 'user not found'));
    user = await user.updateValues(userData);
    return res.jsonApi(null, user);
  }
  catch (err) {
    return res.jsonApi(httpError(500, err));
  }
});

/* POST user create. */
router.post('/', authorize(['admin']), async (req, res, next) => {
  try {
    let { user, isNew } = await Users.findOrCreateByEmail(req.body);
    if (isNew) return res.jsonApi(null, user);
    else return res.jsonApi(httpError(409, "user already exists"));
  }
  catch (err) {
    return res.jsonApi(httpError(500, err));
  }
});

module.exports.isPrivate = true;
module.exports.router = router;
