import fs from 'fs';
import path from 'path';
import plist from 'plist';
import { stdErrorLog, stdOutLog, macLaunchDir, plistLabel } from './config';
import { createFileIfNotExist } from './file';
import logger from './logger';

export function generatePListText(auto: boolean = true) {
    // https://medium.com/@chetcorcos/a-simple-launchd-tutorial-9fecfcf2dbb3
    const config = {
        Label: plistLabel,
        RunAtLoad: auto,
        StandardErrorPath: stdErrorLog,
        StandardOutPath: stdOutLog,
        EnvironmentVariables: {
            PATH: `<![CDATA[${process.env.PATH}]]>`,
        },
        ProgramArguments: [process.env._!, 'start'],
    };
    return plist.build(config);
}

export async function savePList(auto: boolean = true) {
    createFileIfNotExist(stdErrorLog);
    createFileIfNotExist(stdOutLog);
    try {
        const text = generatePListText(auto);
        fs.writeFileSync(path.resolve(macLaunchDir, `./${plistLabel}`), text);
    } catch (e) {
        logger.error('createPList: ', e);
    }
}

export async function setAutoStartup(auto: boolean = true) {
    return await savePList(auto);
}
