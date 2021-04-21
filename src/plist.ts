import fs from 'fs';
import path from 'path';
import plist from 'plist';
import { stdErrorLog, stdOutLog, macLaunchDir, plistLabel } from './config';
import { createFileIfNotExist } from './file';
import logger from './logger';

export function generatePListText(auto: boolean = true) {
    // https://medium.com/@chetcorcos/a-simple-launchd-tutorial-9fecfcf2dbb3
    let cmdPath = process.env._;
    logger.log('\nprocess.env._: ', process.env._);
    if (cmdPath && cmdPath.endsWith('dwp')) {
        cmdPath = cmdPath.replace(/^(.+)(dwp)$/, '$1node');
    }
    const config = {
        Label: plistLabel,
        RunAtLoad: auto,
        StandardErrorPath: stdErrorLog,
        StandardOutPath: stdOutLog,
        EnvironmentVariables: {
            // TODO: 需要cdata包装吗
            // PATH: `<![CDATA[${process.env.PATH}]]>`,
            PATH: process.env.PATH!,
        },
        ProgramArguments: [
            // can't directly use 'dwp', cause permission error
            cmdPath!,
            // TODO: 有没有更好的写法
            path.resolve(__dirname, '../index.js'),
            'start',
        ],
    };
    logger.log('\npath: ', process.env.PATH);
    logger.log('\ncmdPath: ', cmdPath);
    return plist.build(config);
}

export function savePList(auto: boolean = true) {
    if (!process.env._) {
        // not start with node or dwp
        return;
    }
    createFileIfNotExist(stdErrorLog);
    createFileIfNotExist(stdOutLog);
    try {
        const text = generatePListText(auto);
        fs.writeFileSync(path.resolve(macLaunchDir, `./${plistLabel}`), text);
    } catch (e) {
        logger.error('createPList: ', e);
    }
}

export function setAutoStartup(auto: boolean = true) {
    return savePList(auto);
}
