const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const preferenceSchema = new Schema({
  preference: {
    type: String,
    required: true
  }
},
{
  timestamps: true,
});

const Preference = mongoose.model('Preferences', preferenceSchema);
module.exports = Preference;
