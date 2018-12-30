let chai = require('chai');
let agent = require('superagent').agent();
let uniqid = require('uniqid');
let { Users, disconnect } = require('../models');
chai.should();

class User {
    constructor(role) {
        this.name = uniqid();
        this.email = `${this.name}@gmail.com`;
        this.password = 'testpassword';
        this.role = role;
    }

    get credentials () {
        return {
            email: this.email,
            password: this.password
        }
    }

    toJSON () {
        return {
            name: this.name,
            email: this.email,
            password: this.password,
            role: this.role
        }
    }
}

let url = (endpoint) => (`http://localhost:3000/api/${endpoint}`);

async function login(credentials) {
    try {
        return await agent
            .post(url('login'))
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .send(credentials);
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

async function getUsers(email) {
    let userQuery = email?`/${email}`:'';
    try {
        return await agent
            .get(url(`users/${userQuery}`))
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

admin = new User('admin');
user = new User('user');



describe('test user endpoint', function () {
    it ('should initialize the database using the model', async function () {
        await Users.remove({});
        let users = await Users.find();
        users.should.be.an('array');
        users.length.should.eq(0);
        await new Users(admin).save();
        users = await Users.find();
        users.should.be.an('array');
        users.length.should.eq(1);
        await disconnect();
        return;
    })

    it('should login as admin', async function () {
        let resp = await login(admin.credentials);
        resp.status.should.eq(200);
        return resp;
    })

    it('should allow admin to create a user', async function () {
        let resp = await createUser(user);
        resp.status.should.eq(200);
        resp.body.data.email.should.eq(user.email);
        return resp;
    })

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

    it('should logout admin user', async function () {
        let resp = await logout();
        resp.status.should.eq(200);
        return resp;
    })

    it('reject logged out user from creating a new user', async function () {
        let resp = await createUser(user);
        resp.status.should.eq(401);
        return resp;
    })

    it('should login as test user', async function () {
        let resp = await login(user.credentials);
        resp.status.should.eq(200);
        return resp;
    })

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

    it('should logout test user', async function () {
        let resp = await logout();
        resp.status.should.eq(200);
        return resp;
    })

    it('should login as test user (new password)', async function () {
        let resp = await login(user.credentials);
        resp.status.should.eq(200);
        return resp;
    })

    it('should allow user to get itself', async function () {
        let resp = await getUsers('me');
        resp.status.should.eq(200);
        resp.body.data.email.should.eq(user.email);
        resp.body.data.name.should.eq(user.name);
        resp.body.data.role.should.eq(user.role);
        return resp;
    })

})