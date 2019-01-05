const mongoose = require('mongoose');

const Schema = mongoose.Schema;


//
// Gig schema
//
const GigsSchema = new Schema(
  {
    eventName: { type: String, required: true },
    venue: { type: String, required: true },
    venueAddress: { type: String, required: true },
    contactNumber: { type: String, required: true },
    band: { type: String, required: true },
    members: { type: String, required: true },
    date: { type: String, required: true },
    setList: { type: String, required: true },
    callTime: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    requestedSongs: { type: String, required: true },
  },
  {
    strict: 'throw',
    timestamps: true
  }
);

GigsSchema.virtual('isAdmin').get(function () {
  return this.role === 'admin';
});

// List of properties which can be updated
const ALLOWED_UPDATES = [
  'name',


];

//
// Find or create a gig based on email
//
GigsSchema.statics.findOrCreate = async function (userData) {}


//
// Update a gig instance.
// Only update fields that are in the ALLOWED_UPDATES list
//
GigsSchema.methods.updateValues = async function (data) {
  Object.keys(data).forEach(key => {
    if (ALLOWED_UPDATES.indexOf(key) >= 0) this[key] = data[key];
    else console.log(`Attempt to update non allowed field '${key}' with '${data[key]}'`)
  });
  await this.save();
  return this;
}

//
// Remove password when serializing gig instance
//
GigsSchema.methods.toJSON = function () {
  var obj = this.toObject();
  delete obj.password
  return obj;
}

// Export the model based on the schema
module.exports = mongoose.model("Gigs", GigsSchema);
