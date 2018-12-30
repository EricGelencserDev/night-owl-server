const path = require('path');
const mongoose = require('mongoose');
const { db } = require('../config');
const { requireDir } = require('../utils');

// Connect to the mongo DB
mongoose.connect(db.URL, { useNewUrlParser: true }, err => {
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
files.forEach(file => {
    let modelName = file.exports.modelName;
    let model = file.exports
    models[modelName] = model;
});

models.disconnect = async function () {
  await mongoose.disconnect();
}

module.exports = models;