import ps from 'ps-node';
import { checkIfDebugMode } from '../utils';
import { logger } from '../logger';

export function findRunningTasks(): Promise<ps.Program[]> {
  return new Promise((resolve, reject) => {
    ps.lookup({ command: 'node' }, (err, resultList) => {
      if (err) {
        reject(err);
        return;
      }
      const isDebug = checkIfDebugMode();
      const matchPath = `${
        isDebug ? 'daily-wallpaper' : 'dwp'
      }/dist/src/schedule.js`;
      const runningTasks = resultList.filter((item) => {
        if (item.arguments) {
          const p = item.arguments[0];
          if (~p.indexOf(matchPath)) {
            return true;
          }
        }
        return false;
      });
      resolve(runningTasks);
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
