const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
  groupName: {
    type: String,
    required: true
  },
  admin: {
    type: String,
    required: true
  },
  members: {
    type: [String],
    default: []
  }
}, {
  timestamps: true,
});

const Group = mongoose.model('Group', groupSchema);
module.exports = Group;
