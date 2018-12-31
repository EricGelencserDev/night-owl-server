# Overview

This application is a REST API framework for using node/express with mongo/mongoose

The initial framework implements a set of "user" endpoints to do basic CRUD operations on users.

# Adding new routes

Routes are auto loaded from the ./routes/api/controllers directory.
To add additional endpoints, simply add a new file to the ./routes/api/controllers directory with 
the route endpoint definitions. These endpoints will be loaded and registered with the express API router.

The endpoint path will be the same as the filename containing the route controllers.

The inial set of routes are as follows:

    GET     /api                - list exising routes
    POST    /api/login          - local login with email/password
    POST    /api/logout         - logout
    GET     /api/users          - gets a list of all users
    POST    /api/users          - creates a user
    GET     /api/users/:email   - gets a user by email (unique)
    PUT     /api/users/:email   - updates a user by email
    GET     /api/users/me       - gets the currently logged in user

# Adding new models

Models are loaded automatically from the ./models/_models directory. Just add new model files to have
them available to the app.

# Starting the service
A mongo db must be available for this application to work
If you use a database other than the default (running on localhost) you will need to set the 
following ENV variables:

- DB_HOST
- DB_PORT
- DB_NAME

This application can be started as a "stand alone" node app using NPM or as a Docker container.

To start as a native node app use npm:

    npm install
    npm start

To start the api server and database together in containers:
 
    docker-compose run api

To start mongo in a container on it's own
 
    docker run --name database -p 27017:27017  mongo

To connect to the mongo client
 
    docker exec -it database mongo

# Tests

To run the API tests use

    npm test

This will run a set of tests against the user endpoints:

```
npm test

> server@0.0.0 test /home/rob/code/personal/mongodb-node-api
> mocha



(node:26170) ExperimentalWarning: The http2 module is an experimental API.
  test user endpoint
(node:26170) DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead.
Connected to database
(node:26170) DeprecationWarning: collection.remove is deprecated. Use deleteOne, deleteMany, or bulkWrite instead.
    ✓ should initialize the database using the model (268ms)
    ✓ should login as admin (260ms)
    ✓ should allow admin to create a user (243ms)
    ✓ should allow admin to list users
    ✓ should allow admin to get test user
    ✓ should allow admin to update user (237ms)
    ✓ should reject invalid passwords
    ✓ should logout admin user
    ✓ should reject logged out user from creating a new user
    ✓ should login as test user (228ms)
    ✓ should reject test user creating a new user
    ✓ should reject test user listing users
    ✓ should allow test user to update itself (235ms)
    ✓ should logout test user
    ✓ should login as test user (new password) (228ms)
    ✓ should allow user to get itself


  16 passing (2s)
  ```

