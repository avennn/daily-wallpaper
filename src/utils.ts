import { SimpleIntervalSchedule } from 'toad-scheduler';
import { defaultOptions } from './config';

const validIntervalRE = new RegExp(/^(\d+)(s|min|h|d)$/);

export function isValidInterval(interval: string) {
    return validIntervalRE.test(interval);
}

/**
 * parse string such as 1s (or 1min, 1h, 1d) into SimpleIntervalSchedule object
 * @param interval
 */
export function parseInterval(interval: string): SimpleIntervalSchedule {
    const matched = interval.match(validIntervalRE);
    const isValid = !!matched;
    if (!isValid) {
        return parseInterval(defaultOptions.interval);
    }
    const unit = matched![2];
    const digit = Number(matched![1]);
    const short2Long: Record<string, string> = {
        s: 'seconds',
        min: 'minutes',
        h: 'hours',
        d: 'days',
    };
    return { [short2Long[unit]]: digit } as SimpleIntervalSchedule;
}

export function checkIfDebugMode() {
    return !__dirname.match(/(dwp|daily-wallpaper)[\\/]dist/);
}
