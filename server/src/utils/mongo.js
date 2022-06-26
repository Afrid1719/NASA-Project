const mongoose = require('mongoose');

const MONGOBD_URL = 'mongodb+srv://nasa-api:niExQsGah2L1HaD0@cluster0.d5uo0tl.mongodb.net/?retryWrites=true&w=majority';

mongoose.connection.once('open', () => {
    console.log('MongoDB connected!');
});

mongoose.connection.on('error', (err) => {
    console.error(err);
});

async function mongoConnect() {
    await mongoose.connect(MONGOBD_URL);
}

async function mongoDisconnect() {
    await mongoose.disconnect();
}

module.exports = {mongoConnect, mongoDisconnect};