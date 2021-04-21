import { execFile } from 'child_process';
import path from 'path';
import { appName } from './config';
import { covertParams, getParams } from './params';
import type { InputParams, YargsArgv } from '../typings';

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
                resolve('');
            } else {
                reject(stderr);
            }
        });
    });
}

function hasPm2Job() {
    return new Promise((resolve, reject) => {
        execFile('pm2', ['jlist'], (err, stdout, stderr) => {
            if (!err) {
                const match = stdout.match(/(\[.*?\])$/);
                if (match) {
                    try {
                        const list: any[] = JSON.parse(match[1]);
                        const isExist = !!list.find(
                            (item) => item.name === appName
                        );
                        resolve(isExist);
                    } catch (e) {
                        reject(e);
                    }
                } else {
                    reject(new Error('not match'));
                }
            } else {
                reject(stderr);
            }
        });
    });
}

function startPm2Job(argv: YargsArgv) {
    return new Promise((resolve, reject) => {
        execFile(
            'pm2',
            [
                'start',
                path.resolve(__dirname, './schedule.js'),
                '--name',
                appName,
                '--',
                ...covertParams(getParams(argv)),
            ],
            (err, stdout, stderr) => {
                if (!err) {
                    resolve('');
                } else {
                    reject(stderr);
                }
            }
        );
    });
}

function stopPm2Job() {
    return new Promise((resolve, reject) => {
        execFile('pm2', ['stop', appName], (err, stdout, stderr) => {
            if (!err) {
                resolve('');
            } else {
                reject(stderr);
            }
        });
    });
}

function deletePm2Job() {
    return new Promise((resolve, reject) => {
        execFile('pm2', ['delete', appName], (err, stdout, stderr) => {
            if (!err) {
                resolve('');
            } else {
                reject(stderr);
            }
        });
    });
}

export async function execute(cmd: string | number, argv: YargsArgv) {
    try {
        const hasPm2 = await isPm2Installed();
        if (!hasPm2) {
            await installPm2();
        }
        if (cmd === 'start') {
            const isExist = await hasPm2Job();
            if (isExist) {
                await deletePm2Job();
            }
            await startPm2Job(argv);
        } else if (cmd === 'stop') {
            await stopPm2Job();
        }
    } catch (e) {
        console.warn('err', e);
    }
}
