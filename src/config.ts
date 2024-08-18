import os from 'os';
import path from 'path';

const homeDir = os.homedir();
const platform = os.platform();

export const appName = 'daily-wallpaper';
const shortAppName = 'dwp';

function getPictureDirectory() {
	let dir = path.join(homeDir, `./Pictures/${shortAppName}`);
	if (platform === 'win32') {
		// TODO: windows
		dir = path.join(homeDir, `./Pictures/${shortAppName}`);
	}
	return dir;
}

export const website = 'https://cn.bing.com/';

export const picDir = getPictureDirectory();

// log
export const logDir = path.resolve(homeDir, `./.${shortAppName}/logs`);
export const defaultLogFile = path.join(logDir, `${shortAppName}.log`);
export const errorLogFile = path.join(logDir, 'dwp-error.log');
export const DEFAULT_LOG_LINES_COUNT = 50;

export const stdErrorLog = path.join(homeDir, logDir, './stderr.log');
export const stdOutLog = path.join(homeDir, logDir, './stdout.log');

export const macLaunchDir = path.join(homeDir, './Library/LaunchAgents');
export const plistLabel = `com.javenleung.${shortAppName}.plist`;

export const defaultConfig = path.join(homeDir, './.dwp/default.config.json');
export const historyConfig = path.join(homeDir, './.dwp/history.config.json');

export const DEFAULT_START_OPTIONS = {
	interval: '1d',
	max: 3,
	startup: true,
};
