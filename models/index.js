const path = require('path');
const mongoose = require('mongoose');
const requireDir = require('require-dir');

// Connect to the mongo DB
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_NAME = process.env.DB_NAME || 'database';

const dbUrl = `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;

mongoose.connect(dbUrl, { useNewUrlParser: true }, err => {
  if (err) {
    console.log("Error connecting to database", err);
    process.exit(1);
  } else {
    console.log('Connected to database');
  }
});

// Get models in the _models directory
const MODEL_DIR = './_models'
const REQUIRE_PATH = path.resolve(__dirname, MODEL_DIR);
const files = requireDir(REQUIRE_PATH);

// Export a models object with each model
let models = {};
Object.keys(files).forEach(file => {
    let model = files[file];
    let modelName = model.modelName;
    models[modelName] = model;
});

models.disconnect = async function () {
  await mongoose.disconnect();
}

module.exports = models;