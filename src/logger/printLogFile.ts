import chalk from 'chalk';
import cLogger from './cLogger';

export default function printLogFile(log: string): void {
  const output = log
    .replace(
      /(?<=\[)(.+)(?=\]\s+\[(DEBUG|INFO|WARN|ERROR|FATAL)\])/g,
      chalk.greenBright('$1')
    )
    .replace(/(\[INFO\])/g, chalk.blueBright('$1'))
    .replace(/(\[ERROR\])/g, chalk.redBright('$1'));
  cLogger.log(output);
}
