import { execFile } from 'child_process';

export function isPm2Installed() {
    return new Promise((resolve) => {
        execFile('pm2', ['-v'], (err) => {
            if (!err) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}

export function installPm2() {
    return new Promise((resolve, reject) => {
        execFile('npm', ['install', '-g', 'pm2'], (err, stdout, stderr) => {
            if (!err) {
                resolve('success');
            } else {
                reject(stderr);
            }
        });
    });
}
