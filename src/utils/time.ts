import type { SimpleIntervalSchedule } from 'toad-scheduler';
import { DEFAULT_START_OPTIONS } from '@/config';

const validIntervalRE = new RegExp(/^(\d+)(s|m|h|d)$/);

export function isValidInterval(interval: string): boolean {
	return validIntervalRE.test(interval);
}

/**
 * parse string such as 1s (or 1m, 1h, 1d) into SimpleIntervalSchedule object
 * @param interval
 */
export function parseInterval(interval: string): SimpleIntervalSchedule {
	const matched = interval.trim().match(validIntervalRE);
	const isValid = !!matched;
	if (!isValid) {
		return parseInterval(DEFAULT_START_OPTIONS.interval);
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
