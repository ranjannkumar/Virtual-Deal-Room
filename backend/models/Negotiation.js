// models/Negotiation.js
const mongoose = require('mongoose');

const negotiation = new mongoose.Schema({
    deal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Deal',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    offeredPrice: {
        type: Number,
        required: true
    },
    responded: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Index for faster queries on deal ID
negotiation.index({ deal: 1 });

module.exports = mongoose.model('Negotiation', negotiation);