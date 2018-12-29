const passport = require('passport');
const httpError = require('http-errors');
const { Users } = require('./models');

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(async function (id, done) {
    let err = null;
    let user = null;
    try {
        user = await Users.findById(id);
    }
    catch (_err) {
        err = _err
    };
    return done(err, user);
});

module.exports.isLoggedIn = (req, res, next) => {
    if (req.user) {
        console.log('authenticated route authorized');
        return next();
    } else {
        return res.jsonApi(httpError(401, 'not authorized'))
    }
}

module.exports.authenticate = async (email, password, done) => {
    try {
        let { user, isAuth } = await Users.authenticate(email, password);
        if (!isAuth) return done(null, false);
        else return done(null, user);
    }
    catch (err) {
        return done(err);
    }
}

module.exports.authorize = (roles) => {
    return (req, res, next) => {
        user = req.user;
        let isAuth = roles.some(desc => {
            let role = desc.split(':');
            if (role[0] === 'admin') return req.user.isAdmin;
            if (role[0] === 'self') {
                let idField = role[1];
                if (idField) return req.user[idField] = req.params[idField];
                else return res.jsonApi(httpError(500, "no id field specified in 'self' role"));
            }
        });
        if (isAuth) next();
        else res.jsonApi(httpError(401, 'not authorized'));
    }
}