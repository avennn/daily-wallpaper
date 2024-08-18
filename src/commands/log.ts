import { defaultLogFile, errorLogFile } from '../config';
import { echoLogger, printLogFile } from '../logger';
import { tail } from '../shell';

interface LogCommandOptions {
	num: number;
	error: boolean;
}

export default async function log(options: LogCommandOptions): Promise<void> {
	try {
		const { num, error } = options;
		const logFile = error ? errorLogFile : defaultLogFile;
		const result = await tail(num, logFile);
		printLogFile(result);
	} catch (e) {
		echoLogger.fail('Log failed!', e);
	}
}
