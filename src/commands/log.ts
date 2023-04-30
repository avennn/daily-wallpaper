import { tail } from '../shell';
import { defaultLogFile, errorLogFile } from '../config';
import { printLogFile, echoLogger } from '../logger';

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
