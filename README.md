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



