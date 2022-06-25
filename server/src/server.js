const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');

const { loadPlanetsData } = require('./models/planets.model');

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

const MONGOBD_URL = 'mongodb+srv://nasa-api:niExQsGah2L1HaD0@cluster0.d5uo0tl.mongodb.net/?retryWrites=true&w=majority';

mongoose.connection.once('open', () => {
    console.log('MongoDB connected!');
});

mongoose.connection.on('error', (err) => {
    console.error(err);
});

async function startServer() {
    try {
        await mongoose.connect(MONGOBD_URL);
        await loadPlanetsData();
    } catch(e) {
        console.log(e);
    }

    server.listen(PORT, () => {
        console.log(`Server listening on port: ${PORT}`);
    })
}

startServer();