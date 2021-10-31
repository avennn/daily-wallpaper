import { Command, InvalidArgumentError, Option } from 'commander';
import chalk from 'chalk';
import { defaultOptions } from './config';
import { isValidInterval } from './utils';
import { boolean } from 'yargs';

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
                : ['-W, --width <number>', 'width', parseIntArgv];
        case 'height':
            return isShort
                ? ['--height <number>']
                : ['-H, --height <number>', 'height', parseIntArgv];
        case 'interval':
            return isShort
                ? ['--interval <string>']
                : [
                      '-i, --interval <string>',
                      'interval, number + unit, 1s[1 second], 1min[1 minute], 1h[1 hour], 1d[1 day]',
                      parseIntervalArgv,
                      defaultOptions.interval,
                  ];
        case 'max':
            return isShort
                ? ['--max <number>']
                : ['-m, --max <number>', 'max', parseIntArgv];
        case 'startup':
            return isShort ? ['--startup'] : ['-s, --startup', 'startup'];
        case 'no-startup':
            return isShort ? ['--no-startup'] : ['--no-startup', 'no-startup'];
        default:
            return [];
    }
}
