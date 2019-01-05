const express = require('express');
const router = express.Router();
const { Users } = require('../../../models');
const { authorize, isLoggedIn } = require('../../../auth');

// Route authorization rules
let rules = {

  // Allow if user is admin
  isAdmin: (req) => {
    return req.user.isAdmin;
  },

  // Allow if email param is the same as user's email
  isSelf: (req) => {
    return (req.params.email === req.user.email);
  }
}

// Protect all user routes from non-logged in users
router.use(isLoggedIn);

/* GET users listing with query string */
router.get('/', authorize([rules.isAdmin]), async (req, res, next) => {
  try {
    let { filter, fields, populate } = req.jsonQuery;
    let userQuery = Users.find(filter, fields);
    populate.forEach(collection => {
      userQuery.populate(collection);
    });
    let users = await userQuery;
    return res.jsonApi(null, users);
  }
  catch (err) {
    return next([500, err]);
  }
});

/* GET current user */
router.get('/me', async (req, res, next) => {
  try {
    let { fields, populate } = req.jsonQuery;
    let query = { email: req.user.email };
    let userQuery = Users.findOne(query, fields);
    populate.forEach(collection => {
      userQuery.populate(collection);
    });
    let user = await userQuery;
    return res.jsonApi(null, user);
  }
  catch (err) {
    return next([500, err]);
  }
});

/* GET user by email */
router.get('/:email', authorize([rules.isAdmin, rules.isSelf]), async (req, res, next) => {
  try {
    let { fields, populate } = req.jsonQuery;
    let query = { email: req.params.email };
    let userQuery = Users.findOne(query, fields);
    populate.forEach(collection => {
      userQuery.populate(collection);
    })
    let user = await userQuery;
    return res.jsonApi(null, user);
  }
  catch (err) {
    return next([500, err]);
  }
});

/* POST user create. */
router.post('/', authorize([rules.isAdmin]), async (req, res, next) => {
  try {
    let { user, isNew } = await Users.findOrCreateByEmail(req.body);
    if (isNew) return res.jsonApi(null, user);
    else return next([409, "user already exists"]);
  }
  catch (err) {
    if (err.name && err.name === 'ValidationError') return next([400, err]);
    else return next([500, err]);
  }
});

/* PUT user update (by email) */
router.put('/:email', authorize([rules.isAdmin, rules.isSelf]), async (req, res, next) => {
  let userEmail = req.params.email;
  let userData = req.body;

  try {
    let user = await Users.findOne({ email: userEmail });
    if (!user) return next([404, 'user not found']);
    if (user.role !== userData.role && !req.user.isAdmin) return next([401, 'cannot change role'])
    user = await user.updateValues(userData);
    return res.jsonApi(null, user);
  }
  catch (err) {
    if (err.name && err.name === 'ValidationError') return next([400, err.message || 'validation error']);
    else return next([500, err]);
  }
});

module.exports = router;
