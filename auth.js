const passport = require('passport');
const HttpError = require('http-errors');
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
        return res.jsonApi(HttpError(401, 'not authorized'))
    }
}

module.exports.authenticate = async (email, password, done) => {
    try {
        let { user, isAuth } = await Users.authenticate(email, password);
        if (!user) return done(null, null, false);
        if (!isAuth) return done(null, user, false);
        return done(null, user, true);
    }
    catch (err) {
        return done(err);
    }
}

module.exports.authorize = (rules) => {
    return (req, res, next) => {
        try {
            let user = req.user;

            // If any rule passes, allow through
            let isAuth = rules.some(rule => {
                // Handle user field rules
                if (rule.fields) {
                    let fields = Object.keys(rule.fields);
                    return fields.every(field => {
                        return user[field] === rule.fields[field];
                    });
                };

                // Handle request parameter rules
                if (rule.params) {
                    let params = Object.keys(rule.params);
                    return params.every(param => {
                        return user[rule.params[param]] === req.params[param];
                    });
                };
            });

            // If a rule passed allow request through
            if (isAuth) return next();

            // If all rules fails, reject route
            else return next(HttpError(401, 'not authorized'));
        }
        // If an error occurs reject with HttpError
        catch (err) {
            return next(HttpError(500, 'error in route authorization'));
        }
    }
}