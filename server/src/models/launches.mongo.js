const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    flightNumber: {
        type: Number,
        required: true,
    },
    mission: {
        type: String,
        required: true,
    },
    rocket: {
        type: String,
        required: true,
    },
    launchDate: {
        type: Date,
        required: true,
    },
    target: {
        type: String,
        required: true,
    },
    customers: {
        type: [String],
        required: true,
        default: ['ZTM', 'NASA'],
    },
    upcoming: {
        type: Boolean,
        default: true,
    },
    success: {
        type: Boolean,
        default: false,
    }
});

module.exports = mongoose.model('Launches', schema);