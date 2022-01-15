const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const preferenceSchema = new Schema({
    userID: {
		type: String,
		require: true
	},
    preferences: {
        type: [String],
        required: true
     }
},
{
  timestamps: true,
});

const Preference = mongoose.model('Preferences', preferenceSchema);
module.exports = Preference;
