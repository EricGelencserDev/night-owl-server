const path = require('path');
const { isLoggedIn } = require('./auth');
const { requireDir } = require('./utils');

// Load routes
function loadRoutes(router, dir) {
    const ROUTES = requireDir(dir);
    ROUTES.forEach(route => {
        // get the router from the exports object
        let _router = route.exports.router;

        // get route path by using the filename (without the extension)
        let routePath = `/${path.basename(route.filename, '.js')}`
        
        // Add sub-router to route paths
        // if the route is "private" use isLoggedIn in the middleware
        if (route.exports.isPrivate) router.use(routePath, isLoggedIn, _router);
        else router.use(routePath, _router);
    });
}

module.exports = loadRoutes;