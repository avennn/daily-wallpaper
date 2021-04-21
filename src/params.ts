import fs from 'fs';
import { safeJsonParse } from 'tori';
import { getInfo } from 'nc-screen';
import {
    defaultConfig as defaultConfigPath,
    historyConfig as historyConfigPath,
} from './config';
import { fsExistSync, createFileIfNotExist } from './file';
import type { YargsArgv, InputParams } from '../typings';

export function getHistoryConfig() {
    createFileIfNotExist(historyConfigPath);
    const text = fs.readFileSync(historyConfigPath);
    return safeJsonParse(text, {}, { force: true });
}

export function getParams(argv: YargsArgv): InputParams {
    const { width, height, max, interval, history } = argv;
    console.log('input argv: ', argv);
    const config = {
        max: 1,
        interval: '12h',
        history: true,
    } as InputParams;
    const historyConfig = getHistoryConfig();
    Object.assign(config, historyConfig, {
        width,
        height,
        max,
        interval,
        history,
    });
    if (!config.width || !config.height) {
        const info = getInfo();
        if (!config.width) {
            config.width = info.width;
        }
        if (!config.height) {
            config.height = info.height;
        }
    }
    return config;
}

export function covertParams(params: InputParams): string[] {
    const finalKeys = ['width', 'height', 'max', 'interval'];
    const arr: string[] = [];
    Object.keys(params)
        .filter((key) => finalKeys.includes(key))
        .forEach((key) => {
            const val = params[key];
            if (typeof val === 'string') {
                arr.push(`--${key}="${val}"`);
            } else if (typeof val === 'boolean') {
                arr.push(`--${val ? '' : 'no-'}${key}`);
            } else {
                arr.push(`--${key}=${val}`);
            }
        });
    return arr;
}
