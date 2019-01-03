const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//
// Gig schema
//
const GigsSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    date: { type: Date, required: true },
    address: { type: String,  required: true },
    genres: [{ type: String }],
    owner: {type: Schema.Types.ObjectId, ref: 'Users' }
  },
  {
    timestamps: true,
  }
);

GigsSchema.statics.findByOwner = async function (owner) {
    let gigs = await this.find({owner: owner._id})
    return gigs;
}
// Export the model based on the schema
module.exports = mongoose.model("Gigs", GigsSchema);
