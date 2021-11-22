import { InvalidArgumentError } from 'commander';
import chalk from 'chalk';
import { defaultOptions } from './config';
import { isValidInterval } from './utils';

function parseIntArgv(value: string) {
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) {
        throw new InvalidArgumentError('Not a number.');
    }
    return parsedValue;
}

function parseIntervalArgv(value: string) {
    if (!isValidInterval(value)) {
        console.log(
            chalk.yellow(
                `Warning: invalid interval argument, use default value "${defaultOptions.interval}"`
            )
        );
        return defaultOptions.interval;
    }
    return value;
}

export function createOptionArgs(
    type: 'width' | 'height' | 'max' | 'interval' | 'startup' | 'no-startup',
    isShort?: boolean
) {
    switch (type) {
        case 'width':
            return isShort
                ? ['--width <number>']
                : [
                      '-W, --width <number>',
                      "Set wallpaper's width. Not required. Can automatically acquire!",
                      parseIntArgv,
                  ];
        case 'height':
            return isShort
                ? ['--height <number>']
                : [
                      '-H, --height <number>',
                      "Set wallpaper's height. Not required. Can automatically acquire!",
                      parseIntArgv,
                  ];
        case 'interval':
            return isShort
                ? ['--interval <string>']
                : [
                      '-i, --interval <string>',
                      'Interval between two fetching actions, with format of [digit][unit], unit supports s(second),m(minute),h(hour),d(day)',
                      parseIntervalArgv,
                      defaultOptions.interval,
                  ];
        case 'max':
            return isShort
                ? ['--max <number>']
                : [
                      '-m, --max <number>',
                      'Keep latest [max] wallpapers in the dir',
                      parseIntArgv,
                  ];
        case 'startup':
            return isShort
                ? ['--startup']
                : [
                      '-s, --startup',
                      'Whether auto start after your computer launched, default true',
                  ];
        case 'no-startup':
            return isShort
                ? ['--no-startup']
                : [
                      '--no-startup',
                      'Not auto start after your computer launched, defaut false',
                  ];
        default:
            return [];
    }
}
