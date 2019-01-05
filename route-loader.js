const requireDir = require('require-dir');

function loadRoutes(router, dir) {
    const routes = requireDir(dir);
    Object.keys(routes).forEach(route => {
        router.use(`/${route}`, routes[route]);
    });
}

module.exports = loadRoutes;