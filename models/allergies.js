const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const allergieSchema = new Schema({
    userID: {
      type: String,
      require: true
    },
    allergies: {
      type: [String],
      required: true
    }
  },
  {
    timestamps: true,
  });

const Allergie = mongoose.model('Allergies', allergieSchema);
module.exports = Allergie;
