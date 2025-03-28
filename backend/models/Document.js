const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  deal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal',
    required: true,
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  filepath: {
    type: String,
    required: true,
  },
  allowedViewers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
  }],
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);