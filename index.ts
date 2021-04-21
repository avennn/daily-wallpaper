#!/usr/bin/env node

import { execute } from './src/daemon';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import logger from './src/logger';

const argv = yargs(hideBin(process.argv))
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
    .option('history', {
        describe: '使用历史记录, --no-history不使用历史记录',
        type: 'boolean',
    })
    .option('startup', {
        describe: '开机启动, --no-startup不开机启动',
        type: 'boolean',
    })
    .help('help').argv;

// 开始运行
const cmdList = argv._;
if (cmdList.length === 1) {
    logger.log('====>', argv, process.env._);
    execute(cmdList[0], argv);
} else {
    console.error('command line format error');
}
