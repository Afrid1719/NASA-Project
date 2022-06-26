const { getAllLaunches, scheduleNewLaunch, abortLaunch, existsLaunchWithId } = require('../../models/launches.model');

async function httpGetAllLaunches(req, res) {
    return res.status(200).json(await getAllLaunches());
}

async function httpAddNewLaunch(req, res) {
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

    try {
        await scheduleNewLaunch(launch);
        return res.status(201).json(launch);
    } catch (err) {
        return res.status(400).json({error: err.message});
    }
}

async function httpAbortLaunch(req, res) {
    const launchId = +req.params.id;
    const existsLaunch = await existsLaunchWithId(launchId);

    if (!existsLaunch) {
        return res.status(404).json({
            error: 'Launch not found'
        });
    }

    const aborted = await abortLaunch(existsLaunch);

    if (!aborted) {
        return res.status(400).json({error: 'Launch not aborted'})
    }

    return res.status(200).json(aborted);
}

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch
};