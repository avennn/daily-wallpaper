/**
 * file operation
 */
import fs from 'node:fs/promises';
import { logger } from '@/logger';

/**
 * heck if file or directory is accessible by mode
 * @param fileOrDirPath
 * @param mode
 * @returns {Promise<boolean>}
 */
async function isFileAccessible(fileOrDirPath: string, mode?: number): Promise<boolean> {
	try {
		await fs.access(fileOrDirPath, mode);
		return true;
	} catch (e) {
		return false;
	}
}

/**
 * check if file or is exist
 * @param fileOrDirPath
 * @returns {Promise<boolean>}
 */
export async function isFileExist(fileOrDirPath: string): Promise<boolean> {
	return isFileAccessible(fileOrDirPath);
}

export async function isFileReadable(fileOrDirPath: string): Promise<boolean> {
	return isFileAccessible(fileOrDirPath, fs.constants.R_OK);
}

export async function isFileWritable(fileOrDirPath: string): Promise<boolean> {
	return isFileAccessible(fileOrDirPath, fs.constants.W_OK);
}

export async function isFileExecutable(fileOrDirPath: string): Promise<boolean> {
	return isFileAccessible(fileOrDirPath, fs.constants.X_OK);
}

/**
 * get directory of file
 * @param filePath
 * @returns {string}
 */
export function getFileDirectory(filePath: string): string {
	const index = filePath.lastIndexOf('/');
	const dir = filePath.substring(0, index);
	return dir || '/';
}

/**
 * Recursive create directory if it is not existing
 * @param dirPath
 * @returns {Promise<boolean>}
 */
export async function safeCreateDirectory(dirPath: string): Promise<boolean> {
	try {
		const dirExist = await isFileExist(dirPath);
		if (dirExist) {
			const stats = await fs.stat(dirPath);
			if (stats.isDirectory()) {
				return true;
			}
		}
		await fs.mkdir(dirPath, { recursive: true });
		return true;
	} catch (e) {
		logger.error('Fail to create directory, ', e);
		return false;
	}
}

export async function safeCreateFile(filePath: string): Promise<boolean> {
	try {
		const fileExist = await isFileExist(filePath);
		if (fileExist) {
			const stats = await fs.stat(filePath);
			if (stats.isFile()) {
				return true;
			}
		}
		const dirPath = getFileDirectory(filePath);
		const created = safeCreateDirectory(dirPath);
		if (!created) {
			return false;
		}
		await fs.open(filePath, 'a+');
		return true;
	} catch (e) {
		logger.error('Fail to create directory, ', e);
		return false;
	}
}
