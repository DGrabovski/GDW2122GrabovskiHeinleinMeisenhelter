const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dislikeSchema = new Schema({
    userID: {
      type: String,
      require: true
    },
    dislikes: {
      type: [String],
      required: true
    }
  },
  {
    timestamps: true,
  });

const Dislike = mongoose.model('Dislikes', dislikeSchema);
module.exports = Dislike;
