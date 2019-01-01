const path = require('path');
const { requireDir } = require('./utils');

// Load routes
function loadRoutes(router, dir) {
    const ROUTES = requireDir(dir);
    ROUTES.forEach(route => {
        // get the router from the exports object
        let _router = route.exports;

        // get route path by using the filename (without the extension)
        let routePath = `/${path.basename(route.filename, '.js')}`
        
        // Add sub-router to route paths
        router.use(routePath, _router);
    });
}

module.exports = loadRoutes;