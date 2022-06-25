const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    keplerName: {
        type: String,
        required: true,
    }
});