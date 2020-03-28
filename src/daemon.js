const { execFile } = require('child_process');

exports.isPm2Installed = function isPm2Installed() {
    return new Promise(resolve => {
        execFile('pm2', ['-v'], err => {
            if (!err) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
};

exports.installPm2 = function installPm2() {
    return new Promise((resolve, reject) => {
        execFile('npm', ['install', '-g', 'pm2'], (err, stdout, stderr) => {
            if (!err) {
                resolve('success');
            } else {
                reject(stderr);
            }
        });
    });
};
