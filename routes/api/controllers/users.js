const express = require('express');
const httpError = require('http-errors');
const router = express.Router();
const { Users } = require('../../../models');
const { authorize, isLoggedIn } = require('../../../auth');

// Route authorization rules
let rules = {
  isAdmin: {
    fields: {
      isAdmin: true
    }
  },
  isSelf: {
    params: {
      email: 'email'
    }
  }
}

// Protect all user routes from non-logged in users
router.use(isLoggedIn);

/* GET users listing with query string */
router.get('/', authorize([rules.isAdmin, rules.isSelf]), async (req, res, next) => {
  try {
    let query = JSON.parse(req.query.q || null);
    let users = await Users.find(query);
    return res.jsonApi(null, users);
  }
  catch (err) {
    return next(httpError(500, err));
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
    return next(httpError(500, err));
  }
});

/* GET user by email */
router.get('/:email', authorize([rules.isAdmin, rules.isSelf]), async (req, res, next) => {
  try {
    let query = { email: req.params.email }
    let user = await Users.findOne(query);
    return res.jsonApi(null, user);
  }
  catch (err) {
    return next(httpError(500, err));
  }
});

/* POST user create. */
router.post('/', authorize([rules.isAdmin]), async (req, res, next) => {
  try {
    let { user, isNew } = await Users.findOrCreateByEmail(req.body);
    if (isNew) return res.jsonApi(null, user);
    else return next(httpError(409, "user already exists"));
  }
  catch (err) {
    if (err.name && err.name === 'ValidationError') return next(httpError(400, err));
    else return next(httpError(500, err));
  }
});

/* PUT user update (by email) */
router.put('/:email', authorize([rules.isAdmin, rules.isSelf]), async (req, res, next) => {
  let userEmail = req.params.email;
  let userData = req.body;

  try {
    let user = await Users.findOne({ email: userEmail });
    if (!user) return next(httpError(404, 'user not found'));
    if (user.role !== userData.role && !req.user.isAdmin ) return next(httpError(401, 'cannot change role'))
    user = await user.updateValues(userData);
    return res.jsonApi(null, user);
  }
  catch (err) {
    if (err.name && err.name === 'ValidationError') return next(httpError(400, err.message || 'validation error'));
    else return next(httpError(500, err));
  }
});

module.exports = router;
