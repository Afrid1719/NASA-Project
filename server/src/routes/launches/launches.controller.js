const { getAllLaunches, addNewLaunch, abortLaunchById } = require('../../models/launches.model');

function httpGetAllLaunches(req, res) {
    return res.status(200).json(getAllLaunches());
}

function httpAddNewLaunch(req, res) {
    const launch = req.body;

    if (!launch.mission || !launch.rocket || !launch.target || !launch.launchDate) {
        return res.status(400).json({
            error: "Missing required launch data"
        });
    }

    launch.launchDate = new Date(launch.launchDate);

    if (isNaN(launch.launchDate)) {
        return res.status(400).json({
            error: "Invalid launch date"
        });
    }

    const newLaunch = addNewLaunch(launch);
    
    return res.status(201).json(newLaunch);
}

function httpAbortLaunch(req, res) {
    const launchId = +req.params.id;
    const aborted = abortLaunchById(launchId);

    if (!aborted) {
        return res.status(404).json({
            error: 'Launch not found'
        });
    }

    return res.status(200).json(aborted);
}

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch
};