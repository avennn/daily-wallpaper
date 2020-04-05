const schedule = require('node-schedule');
const argv = require('yargs').argv;
const { downloadPicture } = require('./picture');

const { width, height, max } = argv;
const params = {
    width,
    height,
    max,
};

downloadPicture(params);
schedule.scheduleJob('*/12 * * *', () => {
    downloadPicture(params);
});
