import os from 'os';
import path from 'path';

const homeDir = os.homedir();
const platform = os.platform();

function getPictureDirectory() {
    let dir = path.resolve(homeDir, './Pictures/bing-wallpapers');
    if (platform === 'win32') {
        // windows
        dir = path.resolve(homeDir, './Pictures/bing-wallpapers');
    }
    return dir;
}

export const website = 'https://cn.bing.com/';
export const picDir = getPictureDirectory();
export const logDir = path.resolve(homeDir, './.dwp/logs');
export const stdErrorLog = path.resolve(homeDir, './.dwp/logs/stderr.log');
export const stdOutLog = path.resolve(homeDir, './.dwp/logs/stdout.log');
export const macLaunchDir = path.resolve(homeDir, './Library/LaunchAgents');
export const plistLabel = 'com.javenleung.dwp.plist';
