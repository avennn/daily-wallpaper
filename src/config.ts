import os from 'os';
import path from 'path';

const homeDir = os.homedir();
const platform = os.platform();

function getPictureDirectory() {
    let dir = path.resolve(homeDir, './Pictures/dwp');
    if (platform === 'win32') {
        // windows
        dir = path.resolve(homeDir, './Pictures/dwp');
    }
    return dir;
}

export const appName = 'daily-wallpaper';

export const website = 'https://cn.bing.com/';

export const picDir = getPictureDirectory();

export const logDir = path.resolve(homeDir, './.dwp/logs');
export const stdErrorLog = path.resolve(homeDir, './.dwp/logs/stderr.log');
export const stdOutLog = path.resolve(homeDir, './.dwp/logs/stdout.log');

export const macLaunchDir = path.resolve(homeDir, './Library/LaunchAgents');
export const plistLabel = 'com.javenleung.dwp.plist';

export const defaultConfig = path.resolve(
    homeDir,
    './.dwp/default.config.json'
);
export const historyConfig = path.resolve(
    homeDir,
    './.dwp/history.config.json'
);
export const defaultOptions = {
    interval: '1d',
    max: 3,
    startup: true,
};
