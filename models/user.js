const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	userID: {
		type: String,
		require: true
	}
	userName: {
		type: String,
		required: true
	},
	userSurname: {
		type: String,
		required: true
	},
	userEmail: {
		type: String,
		require: true
	}
	userPassword: {
		type: String,
		require: true
  }
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);
module.exports = User;
