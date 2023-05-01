import ps from 'ps-node';
import { checkIfDebugMode } from '../utils';
import { logger } from '../logger';
import Ps, { PsFormattedKey } from '../ps';

interface Task {
  pid: string;
  command: string;
  arguments: string[];
}

export function findRunningTasks(): Promise<ps.Program[]> {
  // eslint-disable-next-line
  return new Promise(async (resolve, reject) => {
    const ps = new Ps();
    ps.all()
      .keys([
        PsFormattedKey.pid,
        PsFormattedKey.command,
        PsFormattedKey.arguments,
      ])
      .execute()
      .then((resultList) => {
        const isDebug = checkIfDebugMode();
        const matchPath = `${
          isDebug ? 'daily-wallpaper' : 'dwp'
        }/dist/src/schedule.js`;
        const runningTasks = (resultList as Task[]).filter((item) => {
          if (~item.command.indexOf(matchPath)) {
            return true;
          }
          return false;
        });
        resolve(
          runningTasks.map((item) => ({
            command: item.command,
            arguments: item.arguments,
            pid: Number(item.pid),
          }))
        );
      })
      .catch((e) => {
        reject(e);
      });
  });
}

function psKill(pid: number): Promise<Error | undefined> {
  return new Promise((resolve) => {
    ps.kill(pid, { signal: 'SIGKILL', timeout: 10 }, (err) => {
      resolve(err);
    });
  });
}

export async function killTasks(
  tasks: ps.Program[]
): Promise<[null[], Error[]]> {
  const errList: Error[] = [];
  const successList: null[] = [];
  const resList = await Promise.all(tasks.map((t) => psKill(t.pid)));
  resList.forEach((item) => {
    if (item) {
      errList.push(item);
      logger.error('Kill tasks failed!');
    } else {
      successList.push(null);
    }
  });
  return [successList, errList];
}
