import fs from 'fs';
import path from 'path';
import plist from 'plist';
import { stdErrorLog, stdOutLog, macLaunchDir, plistLabel } from './config';
import { createFileIfNotExist } from './file';
import logger from './logger';

export function savePList(auto: boolean = true) {
  let cmdPath = process.env._;
  logger.log('process.env._: ', cmdPath);
  if (!cmdPath) {
    // not start with node or dwp
    return;
  }
  createFileIfNotExist(stdErrorLog);
  createFileIfNotExist(stdOutLog);
  try {
    // https://medium.com/@chetcorcos/a-simple-launchd-tutorial-9fecfcf2dbb3
    if (cmdPath.endsWith('dwp')) {
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
    const xml = plist.build(config);
    fs.writeFileSync(path.resolve(macLaunchDir, `./${plistLabel}`), xml);
  } catch (e) {
    logger.error('createPList: ', e);
  }
}

export function setAutoStartup(auto: boolean = true) {
  return savePList(auto);
}
