const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
  userID: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
});

const Token = mongoose.model('Token', tokenSchema);
module.exports = Token;
