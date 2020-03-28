const os = require('os');
const path = require('path');

const homeDir = os.homedir();
const platform = os.platform();

// MacOs
let picDir = path.resolve(homeDir, './Pictures/bing-wallpapers');
if (platform === 'win32') {
    // windows
    picDir = path.resolve(homeDir, './Pictures/bing-wallpapers');
}

module.exports = {
    website: 'https://cn.bing.com/',
    picDir,
};
