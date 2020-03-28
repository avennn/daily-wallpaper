const schedule = require('node-schedule');
const argv = require('yargs').argv;
const { downloadPicture } = require('./picture');

const { width, height } = argv;
const params = {};
if (width) {
    params.w = width;
}
if (height) {
    params.h = height;
}

schedule.scheduleJob('*/12 * * *', () => {
    console.info('job started');
    downloadPicture(params);
});
