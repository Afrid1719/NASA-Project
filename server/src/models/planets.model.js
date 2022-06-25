const { parse } = require('csv-parse');
const fs = require('fs');
const path = require('path');
const PlanetsModel = require('./planets.mongo');

const isHabitable = (planet) => {
    return planet['koi_disposition'] === 'CONFIRMED' 
        && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
        && planet['koi_prad'] < 1.6;
}

async function loadPlanets() {
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'exoplanets.csv'))
            .pipe(parse({
                comment: '#',
                columns: true
            }))
            .on('data', async (data) => {
                if (isHabitable(data)) {
                    // Using update so that if the loadPlanets() is called by multiple clusters then the document is created only once
                    await savePlanet(data);
                }
            })
            .on('end', async () => {
                const habitablePlanets = await getAllPlanets();
                console.log(`${habitablePlanets.length} Habitable Planets found.`);
                resolve();
            })
            .on('error', (err) => {
                reject(err);
            });
    });
}

async function savePlanet(planet) {
    try {
        await PlanetsModel.updateOne({
            keplerName: planet.kepler_name
        }, {
            keplerName: planet.kepler_name
        }, {
            upsert: true
        });
    } catch (err) {
        console.error(`Could not save planet ${err}`);
    }
}

async function getAllPlanets() {
    return await PlanetsModel.find({}, {
        '_id': 0, '__v': 0,
    });
}

module.exports = {
    loadPlanetsData: loadPlanets,
    getAllPlanets
};