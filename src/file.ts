/**
 * file operation
 */
import fs from 'fs';
import logger from './logger';

/**
 * file or directory exist
 */
export function fsExistSync(fPath: string) {
    try {
        fs.accessSync(fPath);
        return true;
    } catch (e) {
        return false;
    }
}

export function createDirIfNotExist(dirPath: string) {
    try {
        const dirExist = fsExistSync(dirPath);
        if (dirExist) {
            const stats = fs.statSync(dirPath);
            if (stats.isDirectory()) {
                return;
            }
        }
        fs.mkdirSync(dirPath, { recursive: true });
    } catch (e) {
        logger.error(e);
    }
}

export function createFileIfNotExist(fPath: string, data: string = '') {
    try {
        const fileExist = fsExistSync(fPath);
        if (fileExist) {
            const stats = fs.statSync(fPath);
            if (stats.isFile()) {
                return;
            }
        }
        const dirPath = getFileDir(fPath);
        createDirIfNotExist(dirPath);
        fs.writeFileSync(fPath, data);
    } catch (e) {
        logger.error(e);
    }
}

/**
 * get directory of a file
 */
export function getFileDir(fPath: string) {
    const index = fPath.lastIndexOf('/');
    const dir = fPath.substring(0, index);
    return dir || '/';
}
