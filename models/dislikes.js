const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dislikeSchema = new Schema({
  dislike: {
    type: String,
    required: true
  }
},
{
  timestamps: true,
});

const Dislike = mongoose.model('Dislikes', dislikeSchema);
module.exports = Dislike;
