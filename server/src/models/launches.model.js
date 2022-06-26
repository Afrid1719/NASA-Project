const LaunchesModel = require('./launches.mongo');
const PlanetsModel = require('./planets.mongo');
const launches = new Map();

var DEFAULT_FLIGHT_NUMBER = 100;

const launch = {
    flightNumber: 100,
    mission: 'Kepler Exploration X',
    rocket: 'Explorer IS1',
    launchDate: new Date('December 27 2030'),
    target: 'Kepler-1652 b',
    customers: ['ZTM','NASA'],
    upcoming: true,
    success: true
};

saveLaunch(launch);

async function saveLaunch(launch) {
    const destinationPlanet = await PlanetsModel.findOne({
        keplerName: launch.target,
    });

    if (!destinationPlanet) {
        throw new Error('No matching planet found');
    }

    await LaunchesModel.findOneAndUpdate({
        flightNumber: launch.flightNumber,
    }, launch, {upsert: true});
}

async function getAllLaunches() {
    return await LaunchesModel.find({}, {
        '_id': 0, '__v': 0
    });
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
    const newFlightNumber = await getLatestFlightNumber() + 1; 

    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ['ZTM', 'NASA'],
        flightNumber: newFlightNumber,
    });

    await saveLaunch(newLaunch);
}

async function existsLaunchWithId(launchId) {
    return await LaunchesModel.findOne({
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
    getAllLaunches,
    scheduleNewLaunch,
    existsLaunchWithId,
    abortLaunch
};