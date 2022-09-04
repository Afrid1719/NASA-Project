const axios = require('axios');
const LaunchesModel = require('./launches.mongo');
const PlanetsModel = require('./planets.mongo');

const SPACEX_API_URL = 'https://api.spacexdata.com/v5/launches/query';

var DEFAULT_FLIGHT_NUMBER = 100;

/** 
const launch = {
    flightNumber: 100, // ==> flight_number
    mission: 'Kepler Exploration X', // ==> name
    rocket: 'Explorer IS1', // ==> rocket.name
    launchDate: new Date('December 27 2030'), // ==> date_local
    target: 'Kepler-1652 b', // 
    customers: ['ZTM','NASA'], // ==> payloads.customers of each payload
    upcoming: true, // ==> upcoming
    success: true // ==> success
};
*/

async function saveLaunch(launch) {
    await LaunchesModel.findOneAndUpdate({
        flightNumber: launch.flightNumber,
    }, launch, {upsert: true});
}

async function populateDatabase() {
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        customers: 1
                    }
                }
            ]
        }
    });

    if (response.status !== 200) {
        console.log('Error downloading launch data!!');
        throw new Error('Error downloading launch data!!');
    }

    const launchDocs = response.data.docs;

    for (let launchDoc of launchDocs) {
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap(payload => {
            return payload.customers;
        });
        
        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: new Date(launchDoc['date_local']),
            success: launchDoc['success'],
            upcoming: launchDoc['upcoming'],
            customers
        };

        console.log(`${launch.flightNumber} ${launch.mission}`);

        await saveLaunch(launch);
    }
}

async function loadLaunchData() {
    console.log('Downloading SPACEX data...');

    const firstLaunch = await findLaunch({
        flightNumber: 1,
        mission: 'FalconSat',
        rocket: 'Falcon 1'
    });

    if (firstLaunch) {
        console.log('Databse already populated!')
    } else {
        await populateDatabase();
    }
}

async function getAllLaunches(skip, limit) {
    return await LaunchesModel
    .find({}, {
        '_id': 0, '__v': 0
    })
    .sort({flightNumber: 1})
    .skip(skip)
    .limit(limit);
}

async function getLatestFlightNumber () {
    const latestFlightNumber = await LaunchesModel
        .findOne()
        .sort('-flightNumber');
    
    if (!latestFlightNumber) {
        return DEFAULT_FLIGHT_NUMBER;
    }

    return latestFlightNumber.flightNumber;
}

async function scheduleNewLaunch(launch) {
    const destinationPlanet = await PlanetsModel.findOne({
        keplerName: launch.target,
    });

    if (!destinationPlanet) {
        throw new Error('No matching planet found');
    }

    const newFlightNumber = await getLatestFlightNumber() + 1; 

    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ['ZTM', 'NASA'],
        flightNumber: newFlightNumber,
    });

    await saveLaunch(newLaunch);
}

async function findLaunch(filter) {
    return await LaunchesModel.findOne(filter);
}

async function existsLaunchWithId(launchId) {
    return await findLaunch({
        flightNumber: launchId,
    });
}

async function abortLaunch(launch) {
    const aborted = await LaunchesModel.updateOne({
        flightNumber: launch.flightNumber,
    }, {
        success: false,
        upcoming: false
    });

    return aborted.acknowledged == true && aborted.modifiedCount === 1;
}

module.exports = {
    loadLaunchData,
    getAllLaunches,
    scheduleNewLaunch,
    existsLaunchWithId,
    abortLaunch
};