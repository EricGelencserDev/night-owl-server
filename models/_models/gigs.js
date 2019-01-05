const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//
// Gig schema
//
const GigsSchema = new Schema(
  {
    // eventName: { type: String, required: true },
    // venue: { type: String, required: true },
    address: { type: String, required: true },
    // contactNumber: { type: String, required: true },
    // band: { type: String, required: true },
    // members: { type: String, required: true },
    // setList: { type: String, required: true },
    // callTime: { type: String, required: true },
    // startTime: { type: String, required: true },
    // endTime: { type: String, required: true },
    // requestedSongs: { type: String, required: true },
    type: { type: String, required: true },
    date: { type: Date, required: true },
    genres: [{ type: String }],
    owner: { type: Schema.Types.ObjectId, ref: 'Users' },
    members: [{ type: Schema.Types.ObjectId, ref: 'Users' }],

  },
  {
    timestamps: true,
  }
);

GigsSchema.statics.findByOwner = async function (owner, query) {
  query = query || {};
  query.fields = query.fields || [];
  query.populate = query.populate || [];

  let gigQuery = this.find({ owner: owner._id });
  query.populate.forEach(collection => {
    gigQuery.populate(collection);
  });
  let gigs = await gigQuery;
  return gigs;
}

GigsSchema.statics.findByMember = async function (member, query) {
  query = query || {};
  query.fields = query.fields || [];
  query.populate = query.populate || [];

  let gigQuery = this.find({ members: { "$in": [member._id] } }, query.fields);
  query.populate.forEach(collection => {
    gigQuery.populate(collection);
  });
  let gigs = await gigQuery;
  return gigs;
}
// Export the model based on the schema
module.exports = mongoose.model("Gigs", GigsSchema);
