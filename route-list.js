const ListRoutes = require('express-list-endpoints');

function parseRouteList(routeList) {
    let paths = [];
    Object.keys(routeList).forEach(root => {
        Object.keys(routeList[root]).forEach(route => {
            let routePath = route;
            routeList[root][route].forEach(endpoint => {
                endpoint.methods.forEach(method => {
                    let pathStr = `${root}${routePath}${endpoint.path}`.replace('//','/');
                    if (pathStr.length > 1) pathStr = pathStr.replace(/\/$/, '');
                    let path = {
                        method: method,
                        endpoint: pathStr
                    }
                    paths.push(path);
                });
            })
        })
    })
    
    paths.sort((a, b) => {
        if (a.endpoint === b.endpoint) {
            if (a.method > b.method) return 1;
            if (a.method < b.method) return -1;
        }
        if (a.endpoint > b.endpoint) return 1;
        if (a.endpoint < b.endpoint) return -1;
    })
    return paths;
}


class RouteList {
    constructor (path, router) {
        this.routeList = {};
        this.root = path || '';
        if (router) this.add('', router);
    }

    add(path, router) {
        this.routeList[this._root][path] = ListRoutes(router);
    }

    use (path, router) {
        this.add(path, router);
    }

    get routes () {
        return parseRouteList(this.routeList);
    }

    set root (_root) {
        this._root = _root;
        if (this._root === '/') this._root = '';
        this.routeList[this._root] = {};
    }

    get root () {
        return this._root;
    }

    get list () {
        let list = '';
        this.routes.forEach(route => {
            list = `${list}${route.method}\t${route.endpoint}\n`;
        })
        return list;
    }
}

module.exports = RouteList;