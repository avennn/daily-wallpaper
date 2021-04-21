import fs from 'fs';
import { safeJsonParse } from 'tori';
import { getInfo } from 'nc-screen';
import { historyConfig as historyConfigPath } from './config';
import { createFileIfNotExist } from './file';
import type { YargsArgv, InputParams } from '../typings';

export function isValidInterval(val?: string) {
    return val && /\d+(s|m|h|d)$/.test(val);
}

export function getHistoryConfig() {
    createFileIfNotExist(historyConfigPath);
    const text = fs.readFileSync(historyConfigPath);
    const result = safeJsonParse(text, {}, { force: true });
    if (typeof result.width !== 'number' || result.width < 0) {
        delete result.width;
    }
    if (typeof result.height !== 'number' || result.height < 0) {
        delete result.height;
    }
    if (typeof result.height !== 'number' || result.max <= 0) {
        delete result.max;
    }
    if (
        typeof result.interval !== 'string' ||
        !isValidInterval(result.interval)
    ) {
        delete result.interval;
    }
    return result;
}

export function getParams(argv: YargsArgv): InputParams {
    const { width, height, max, interval, history } = argv;
    console.log('input argv: ', argv);
    const defaultConfig = {
        max: 1,
        interval: '12h',
    };
    const config = {} as InputParams;
    const useHistory = !Object.is(history, false);
    if (useHistory) {
        const historyConfig = getHistoryConfig();
        Object.assign(config, {
            width: width || historyConfig.width,
            height: height || historyConfig.height,
            max: max || historyConfig.max || defaultConfig.max,
            interval:
                interval || historyConfig.interval || defaultConfig.interval,
        });
    } else {
        Object.assign(config, {
            width,
            height,
            max: max || defaultConfig.max,
            interval: interval || defaultConfig.interval,
        });
    }

    if (!config.width || !config.height) {
        const info = getInfo();
        if (!config.width) {
            config.width = info.width;
        }
        if (!config.height) {
            config.height = info.height;
        }
    }
    console.log('config: ', config);
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
