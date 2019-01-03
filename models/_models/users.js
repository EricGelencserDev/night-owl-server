const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const pwConf = require('../../config').passwords;
const Schema = mongoose.Schema;

// Validation rules
function validate(field) {
  const validation = {
    // Validate password field
    password: [
      function (value) {
        return (value.length >= pwConf.length.min && value.length <= pwConf.length.max);
      },
      'password does not match validation settings'
    ],

    // Validate email field
    email: [
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'email does not match validation pattern'
    ]
  };
  return validation[field] || [() => (true), ''];
}

//
// User schema
//
const UsersSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, validate: validate('email') },
    role: { type: String, enum : ['admin', 'user'], required: true },
    password: { type: String, required: true, select: false, validate: validate('password') }
  },
  {
    strict: 'throw',
    timestamps: true,
    toObject: {
      getters: true
    },
    toJSON: {
      virtuals: true
    }
  }
);

// Add a virtual isAdmin boolean
UsersSchema.virtual('isAdmin').get(function () {
  return this.role === 'admin';
});

// Add a virtual gigs collection
UsersSchema.virtual('gigs', {
  ref: 'Gigs',
  localField: '_id',
  foreignField: 'owner'
});

// List of properties which can be updated
const ALLOWED_UPDATES = [
  'name',
  'password',
  'role'
];

//
// Middleware for bcrypt hashing a users password 
//
async function hashPassword(next) {
  if (this.password) this.password = await bcrypt.hash(this.password, pwConf.rounds);
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
