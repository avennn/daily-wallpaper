import { InvalidArgumentError } from 'commander';
import { DEFAULT_START_OPTIONS } from '@/config';
import { isValidInterval } from '@/utils/time';

export function parseArgv2Integer(value: string) {
	const parsedValue = Number.parseInt(value, 10);
	if (Number.isNaN(parsedValue)) {
		throw new InvalidArgumentError('Must be an integer.');
	}
	return parsedValue;
}

export function parseArgv2Interval(value: string) {
	if (!isValidInterval(value)) {
		throw new InvalidArgumentError(
			`Warning: invalid interval argument, use default value "${DEFAULT_START_OPTIONS.interval}"`,
		);
	}
	return value;
}
