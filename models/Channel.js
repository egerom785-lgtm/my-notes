const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  isVoice: { type: Boolean, default: false },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Channel', schema);
