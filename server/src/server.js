require('dotenv').config();
const http = require('http');
const app = require('./app');

const { loadPlanetsData } = require('./models/planets.model');
const { loadLaunchData } = require('./models/launches.model');
const { mongoConnect } = require('./services/mongo');

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

async function startServer() {
    try {
        await mongoConnect();
        await loadPlanetsData();
        await loadLaunchData();
    } catch(e) {
        console.log(e);
    }

    server.listen(PORT, () => {
        console.log(`Server listening on port: ${PORT}`);
    })
}

startServer();