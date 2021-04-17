import fs from 'fs';
import path from 'path';
import plist from 'plist';
import { stdErrorLog, stdOutLog, macLaunchDir, plistLabel } from './config';
import { createFileIfNotExist } from './file';
import logger from './logger';

export function generatePListText(autoLaunch: boolean = false) {
    // https://medium.com/@chetcorcos/a-simple-launchd-tutorial-9fecfcf2dbb3
    const config = {
        Label: plistLabel,
        RunAtLoad: autoLaunch,
        StandardErrorPath: stdErrorLog,
        StandardOutPath: stdOutLog,
        // WorkingDirectory: '/Users/chet/demo',
        ProgramArguments: ['dwp', 'start'],
    };
    return plist.build(config);
}

export async function createPList(autoLaunch: boolean = false) {
    createFileIfNotExist(stdErrorLog);
    createFileIfNotExist(stdOutLog);
    try {
        const text = generatePListText(autoLaunch);
        fs.writeFileSync(path.resolve(macLaunchDir, `./${plistLabel}`), text);
    } catch (e) {
        logger.error('createPList: ', e);
    }
}
