/**
 * file operation
 */
import fs from 'fs';
import logger from './logger';

/**
 * file or directory exist
 */
export function fsExistSync(fPath: string): boolean {
  try {
    fs.accessSync(fPath);
    return true;
  } catch (e) {
    return false;
  }
}

export function createDirIfNotExist(dirPath: string): boolean {
  try {
    const dirExist = fsExistSync(dirPath);
    if (dirExist) {
      const stats = fs.statSync(dirPath);
      if (stats.isDirectory()) {
        return true;
      }
    }
    fs.mkdirSync(dirPath, { recursive: true });
    return true;
  } catch (e) {
    logger.error(e);
    return false;
  }
}

export function createFileIfNotExist(fPath: string, data = ''): boolean {
  try {
    const fileExist = fsExistSync(fPath);
    if (fileExist) {
      const stats = fs.statSync(fPath);
      if (stats.isFile()) {
        return true;
      }
    }
    const dirPath = getFileDir(fPath);
    const created = createDirIfNotExist(dirPath);
    if (!created) {
      return false;
    }
    fs.writeFileSync(fPath, data);
    return true;
  } catch (e) {
    logger.error(e);
    return false;
  }
}

/**
 * get directory of a file
 */
export function getFileDir(fPath: string): string {
  const index = fPath.lastIndexOf('/');
  const dir = fPath.substring(0, index);
  return dir || '/';
}
