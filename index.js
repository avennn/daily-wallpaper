#!/usr/bin/env node

const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const { isPm2Installed, installPm2 } = require('./src/daemon');

const argv = require('yargs')
    .option('v', {
        alias: 'version',
    })
    .option('h', {
        alias: 'help',
    })
    .option('width', {
        describe: '壁纸宽度',
        type: 'number',
    })
    .option('height', {
        describe: '壁纸高度',
        type: 'number',
    })
    .option('max', {
        describe: '最多保存多少张图片',
        type: 'number',
    })
    .option('interval', {
        describe: '每隔多久请求一次图片',
        type: 'string',
    })
    .option('mode', {
        describe: '模式',
        type: 'string',
        choices: ['normal'],
    })
    .help('help').argv;

const appName = 'daily-wallpaper';

function transmitArgvs() {
    const keys = ['width', 'height', 'max', 'interval', 'mode'];
    const arr = [];
    keys.forEach(key => {
        if (Object.keys(argv).includes(key)) {
            const val = argv[key];
            if (typeof val === 'string') {
                arr.push(`--${key}="${val}"`);
            } else {
                arr.push(`--${key}=${val}`);
            }
        }
    });
    return arr;
}

function hasPm2Job() {
    return new Promise((resolve, reject) => {
        execFile('pm2', ['jlist'], (err, stdout, stderr) => {
            if (!err) {
                const match = stdout.match(/(\[.*?\])$/);
                if (match) {
                    try {
                        const list = JSON.parse(match[1]);
                        const isExist = !!list.find(
                            item => item.name === appName,
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

function startPm2Job() {
    return new Promise((resolve, reject) => {
        execFile(
            'pm2',
            [
                'start',
                path.resolve(__filename, '../src/schedule.js'),
                '--name',
                appName,
                '--',
                ...transmitArgvs(),
            ],
            (err, stdout, stderr) => {
                if (!err) {
                    resolve();
                } else {
                    reject(stderr);
                }
            },
        );
    });
}

function stopPm2Job() {
    return new Promise((resolve, reject) => {
        execFile('pm2', ['stop', appName], (err, stdout, stderr) => {
            if (!err) {
                resolve();
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
                resolve();
            } else {
                reject(stderr);
            }
        });
    });
}

async function execute(cmd) {
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
            await startPm2Job();
        } else if (cmd === 'stop') {
            await stopPm2Job();
        }
    } catch (e) {
        console.warn('err', e);
    }
}

// 开始运行
const cmdList = argv._;
if (cmdList.length === 1) {
    execute(cmdList[0]);
}
