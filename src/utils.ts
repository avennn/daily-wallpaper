import { SimpleIntervalSchedule } from 'toad-scheduler';
import chalk from 'chalk';
import { defaultStartOptions } from './config';

const validIntervalRE = new RegExp(/^(\d+)(s|m|h|d)$/);

export function isValidInterval(interval: string): boolean {
  return validIntervalRE.test(interval);
}

/**
 * parse string such as 1s (or 1m, 1h, 1d) into SimpleIntervalSchedule object
 * @param interval
 */
export function parseInterval(interval: string): SimpleIntervalSchedule {
  const matched = interval.match(validIntervalRE);
  const isValid = !!matched;
  if (!isValid) {
    return parseInterval(defaultStartOptions.interval);
  }
  const unit = matched[2];
  const digit = Number(matched[1]);
  const short2Long: Record<string, string> = {
    s: 'seconds',
    m: 'minutes',
    h: 'hours',
    d: 'days',
  };
  return { [short2Long[unit]]: digit } as SimpleIntervalSchedule;
}

export function checkIfDebugMode(): boolean {
  return !__dirname.match(/dwp[\\/]dist/);
}

export function beautifyLog(output: string): string {
  return output
    .replace(
      /(?<=\[)(.+)(?=\]\s+\[(DEBUG|INFO|WARN|ERROR|FATAL)\])/g,
      chalk.greenBright('$1')
    )
    .replace(/(\[INFO\])/g, chalk.blueBright('$1'))
    .replace(/(\[ERROR\])/g, chalk.redBright('$1'));
}
