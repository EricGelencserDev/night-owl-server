let chai = require('chai');
let agent = require('superagent').agent();
let uniqid = require('uniqid');
let { Users, Gigs, disconnect } = require('../models');
chai.should();

class User {
    constructor(role) {
        this.name = uniqid();
        this.email = `${this.name}@gmail.com`;
        this.password = uniqid();
        this.role = role;
    }

    get credentials() {
        return {
            email: this.email,
            password: this.password
        }
    }

    toJSON() {
        return {
            name: this.name,
            email: this.email,
            password: this.password,
            role: this.role
        }
    }
}

class Gig {
    constructor() {
        this.name = `test gig ${uniqid()}`;
        this.date = new Date();
        this.type = 'birthday';
        this.address = '1134 Felspar St #3';
        this.genres = ['jazz', 'big band', 'swing'];
    }
}

let url = (endpoint, queries) => {
    let query = [];
    queries = queries || {};
    if (typeof queries === 'string') queryStr = query;
    else {
        if (queries.filter) query.push(`filter=${JSON.stringify(queries.filter)}`);
        if (queries.fields) query.push(`fields=${JSON.stringify(queries.fields)}`);
        if (queries.includes) query.push(`includes=${JSON.stringify(queries.includes)}`);
        queryStr = query.length ? `?${query.join('&')}` : '';
    }
    let url = `http://localhost:3000/api/${endpoint}${queryStr}`;
    return url;
};

async function createGig(gig) {
    try {
        return await agent
            .post(url('gigs'))
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .send(gig);
    } catch (err) {
        return err;
    }
}

async function getGigs(id, query) {
    id = id || '';
    try {
        return await agent
            .get(url(`gigs/${id}`, query))
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .send(user);
    } catch (err) {
        return err;
    }
}

async function createUser(user) {
    try {
        return await agent
            .post(url('users'))
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .send(user);
    } catch (err) {
        return err;
    }
}

async function getUsers(email, query) {
    let userEmail = email ? `/${email}` : '';
    try {
        let _url = url(`users/${userEmail}`, query)
        return await agent
            .get(_url)
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .send(user);
    } catch (err) {
        return err;
    }
}

async function updateUser(user) {
    let userQuery = `/${user.email}`
    try {
        return await agent
            .put(url(`users/${userQuery}`))
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .send(user);
    } catch (err) {
        return err;
    }
}

function login(user) {
    return async function () {
        try {
            return await agent
                .post(url('login'))
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send(user.credentials);
        } catch (err) {
            return err;
        }
    }
}

async function logout() {
    try {
        return await agent
            .post(url('logout'))
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
    } catch (err) {
        return err;
    }
}

//
// Setup test users
//
let admin = new User('admin');
let user = new User('user');

before(async function () {
    try {
        await Users.remove({});
        await new Users(admin).save();
        await new Gigs(new Gig());
    }
    catch (err) {
        console.error('error initializing database:', err);
        throw (err);
    }
    finally {
        await disconnect();
        return;
    }
})

describe('test admin functions', function () {

    beforeEach(login(admin));
    afterEach(logout);

    describe('test create users', function () {

        it('should allow admin to create a user', async function () {
            let resp = await createUser(user);
            resp.status.should.eq(200);
            resp.body.data.email.should.eq(user.email);
            return resp;
        })
    })

    describe('test read users and gigs', function () {

        it('should allow admin to list users', async function () {
            let resp = await getUsers();
            resp.status.should.eq(200);
            resp.body.data.should.be.an('array');
            resp.body.data.length.should.eq(2);
            return resp;
        })

        it('should allow admin to get test user', async function () {
            let resp = await getUsers(user.email);
            resp.status.should.eq(200);
            resp.body.data.email.should.eq(user.email);
            return resp;
        })

        it('should allow admin to get list of users using json query', async function () {
            let resp = await getUsers('', {
                filter: {
                    role: 'user'
                }
            });
            resp.status.should.eq(200);
            resp.body.data.length.should.eq(1);
            return resp;
        })

        it('should allow admin to get list of all users with selected fields', async function () {
            let resp = await getUsers('', {
                fields: ['email'],
                includes: ['gigs']
            });
            resp.status.should.eq(200);
            resp.body.data.length.should.eq(2);
            resp.body.data[0].should.have.property('email');
            resp.body.data[1].should.have.property('email');
            resp.body.data[0].should.not.have.property('name');
            resp.body.data[1].should.not.have.property('name');
            resp.body.data[0].should.not.have.property('role');
            resp.body.data[1].should.not.have.property('role');
            return resp;
        })
    })

    describe('test update users', function () {

        it('should allow admin to update user', async function () {
            user.password = uniqid();
            user.name = uniqid();
            let resp = await updateUser(user);
            resp.status.should.eq(200);
            let resp2 = await getUsers(user.email);
            resp2.status.should.eq(200);
            resp2.body.data.name.should.eq(user.name);
            return resp;
        })

        it('should reject invalid passwords', async function () {
            let updatedUser = {
                ...user
            }
            updatedUser.password = 'fail';
            let resp = await updateUser(updatedUser);
            resp.status.should.eq(400);
            return resp;
        })

        it('should reject invalid role', async function () {
            let updatedUser = {
                ...user
            }
            updatedUser.role = 'fail';
            let resp = await updateUser(updatedUser);
            resp.status.should.eq(400);
            return resp;
        })
    })
})

describe('test un-authenticated route control', function () {

    before(logout);

    it('should reject anonymous users from creating a new user', async function () {
        let resp = await createUser(user);
        resp.status.should.eq(401);
        return resp;
    })

    it('should reject anonymous users from listing users', async function () {
        let resp = await getUsers();
        resp.status.should.eq(401);
        return resp;
    })

    it('should reject anonymous users from listing itself', async function () {
        let resp = await getUsers('me');
        resp.status.should.eq(401);
        return resp;
    })
})

describe('test user functions', function () {

    beforeEach(login(user));
    afterEach(logout);

    it('should reject test user creating a new user', async function () {
        let newUser = new User('user');
        let resp = await createUser(newUser);
        resp.status.should.eq(401);
        return resp;
    })

    it('should reject test user listing users', async function () {
        let resp = await getUsers();
        resp.status.should.eq(401);
        return resp;
    })

    it('should allow test user to update itself', async function () {
        user.password = uniqid();
        user.name = uniqid();
        let resp = await updateUser(user);
        resp.status.should.eq(200);
        let resp2 = await getUsers(user.email);
        resp2.status.should.eq(200);
        resp2.body.data.name.should.eq(user.name);
        return resp;
    })

    it('should reject test user from changing its role', async function () {
        let updatedUser = {
            ...user,
            role: 'admin'
        };
        let resp = await updateUser(updatedUser);
        resp.status.should.eq(401);
        let resp2 = await getUsers(user.email);
        resp2.status.should.eq(200);
        resp2.body.data.role.should.eq('user');
        return resp;
    })
});

describe('test updated user', function () {

    beforeEach(login(user));
    afterEach(logout);

    it('should allow user to get itself', async function () {
        let resp = await getUsers('me');
        resp.status.should.eq(200);
        resp.body.data.email.should.eq(user.email);
        resp.body.data.name.should.eq(user.name);
        resp.body.data.role.should.eq(user.role);
        return resp;
    })
})

describe('test gigs user', function () {

    beforeEach(login(user));
    afterEach(logout);

    it('should reject user listing all gigs', async function () {
        let resp = await getGigs();
        resp.status.should.eq(401);
        return resp;
    })

    it('should allow user to create a gig', async function () {
        let resp = await createGig(new Gig());
        resp.status.should.eq(200);
        return resp;
    })

    it('should allow user to list their gigs', async function () {
        let resp = await getGigs('mine');
        resp.status.should.eq(200);
        return resp;
    })
})