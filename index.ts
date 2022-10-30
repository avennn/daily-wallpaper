#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import { safeJsonParse } from 'tori';
import { createOptionArgs } from './src/command';
import { start, stop, list, log } from './src/index';

try {
  const pkgJsonText = fs.readFileSync(path.join(__dirname, '../package.json'), {
    encoding: 'utf8',
  });
  const { version } = safeJsonParse(pkgJsonText, {});

  const program = new Command();
  program.version(version, '-v, --version');
  program
    .command('start')
    .description('Start a cron job.')
    .option(...(createOptionArgs('width') as [string, string, () => number]))
    .option(...(createOptionArgs('height') as [string, string, () => number]))
    .option(
      ...(createOptionArgs('interval') as [
        string,
        string,
        () => string,
        string
      ])
    )
    .option(...(createOptionArgs('max') as [string, string, () => number]))
    .option(...(createOptionArgs('startup') as [string, string]))
    .option(...(createOptionArgs('no-startup') as [string, string]))
    .action((options) => {
      start(options);
    });
  program
    .command('stop')
    .description('Stop all cron jobs.')
    .action(() => {
      stop();
    });
  program
    .command('list')
    .description('List all cron jobs in table.')
    .action(() => {
      list();
    });
  program
    .command('log')
    .description('Show logs.')
    .option(...(createOptionArgs('log-num') as [string, string, () => number]))
    .option(
      ...(createOptionArgs('log-error') as [string, string, () => number])
    )
    .action((options) => {
      log(options);
    });

  program.parse();
} catch (e) {
  console.error(e);
}
