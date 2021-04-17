import os from 'os';
import path from 'path';

const homeDir = os.homedir();
const platform = os.platform();

// MacOs
let dir = path.resolve(homeDir, './Pictures/bing-wallpapers');
if (platform === 'win32') {
    // windows
    dir = path.resolve(homeDir, './Pictures/bing-wallpapers');
}

export const website = 'https://cn.bing.com/';
export const picDir = dir;
