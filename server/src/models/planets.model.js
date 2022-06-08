const { parse } = require('csv-parse');
const fs = require('fs');
const path = require('path');

let habitablePlanets = [];

const isHabitable = (planet) => {
    return planet['koi_disposition'] === 'CONFIRMED' 
        && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
        && planet['koi_prad'] < 1.6;
}

function loadPlanets() {
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'exoplanets.csv'))
            .pipe(parse({
                comment: '#',
                columns: true
            }))
            .on('data', (data) => {
                if (isHabitable(data)) {
                    habitablePlanets.push(data);
                }
            })
            .on('end', () => {
                console.log(`${habitablePlanets.length} Habitable Planets found.`);
                resolve();
            })
            .on('error', (err) => {
                reject(err);
            });
    });
}

function getAllPlanets() {
    return habitablePlanets;
}

module.exports = {
    loadPlanetsData: loadPlanets,
    getAllPlanets
};