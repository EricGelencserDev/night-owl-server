#Overview

This application is a REST API framework for using node/express with mongo/mongoose

The initial framework implements a set of "user" endpoints to do basic CRUD operations on users.

# Adding new routes

To add additional endpoints, simply add a new file to the ./routes/api/controllers directory with 
the route endpoint definitions. 

The endpoint path will be the same as the filename containing the route controllers.

# Adding new models

Models are loaded automatically from the ./models/_models directory. Just add new model files to have
them availabe to the app.

# Starting the service

To start the api server and database together
    docker-compose run api

To start mongo in a container 
    docker run --name database -p 27017:27017  mongo

To connect to the mongo client
    docker exec -it database mongo



