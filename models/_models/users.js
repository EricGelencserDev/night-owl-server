const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

//
// User schema
//
const UsersSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    password: { type: String, required: true, select: false }
  },
  {
    timestamps: true
  }
);

UsersSchema.virtual('isAdmin').get(function () {
  return this.role === 'admin';
});

// List of properties which can be updated
const ALLOWED_UPDATES = [
  'name',
  'password'
];

//
// Middleware for bcrypt hashing a users password 
//
async function hashPassword(next) {
  if (this.password) {
    console.log("Hashing pw");
    this.password = await bcrypt.hash(this.password, 12);
  }
  return next();
}

// Add password hashing function to save and update middleware
UsersSchema.pre('save', hashPassword);
UsersSchema.pre('update', hashPassword);

//
// Authenticate a users email and password
//
// Return user and isAuth = true if match
// else return null and isAuth false
//
UsersSchema.statics.authenticate = async function (email, password) {
  // get the user by email, and get the password (hashed) as well
  let user = await this.findOne({ email: email }).select('+password');
  let isAuth = false;
  if (user) {
    isAuth = await bcrypt.compare(password, user.password);
    if (!isAuth) user = null;
  }
  return { user, isAuth }
}

//
// Find or create a user based on email
//
UsersSchema.statics.findOrCreateByEmail = async function (userData) {

  // Find user based on email (unique)
  let user = await this.findOne({ email: userData.email });
  let isNew = false;

  // If this user is not found, then create a new user, save it, and return the user with isNew true 
  // otherwise return the user with isNew false
  if (!user) {
    user = await new this(userData).save();
    isNew = true;
  }

  // Return user, isNew
  return { user, isNew };
};

//
// Update a user instance.
// Only update fields that are in the ALLOWED_UPDATES list
// Keep all others as is
// Log attempts at non-allowed fields (could throw error)
//
UsersSchema.methods.updateValues = async function (data) {
  Object.keys(data).forEach(key => {
    if (ALLOWED_UPDATES.indexOf(key) >= 0) this[key] = data[key];
    else console.log(`Attempt to update non allowed field '${key}' with '${data[key]}'`)
  });
  await this.save();
  return this;
}

//
// Remove password when serializing user instance
//
UsersSchema.methods.toJSON = function () {
  var obj = this.toObject();
  delete obj.password
  return obj;
}

// Export the model based on the schema
module.exports = mongoose.model("Users", UsersSchema);
