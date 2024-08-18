import fs from 'node:fs/promises';
import path from 'node:path';
import dirname from '@/system/dirname';
import { safeJsonParse } from 'tori';

export default async function getAppVersion() {
	const pkgJsonText = await fs.readFile(path.join(dirname(import.meta.url), '../../package.json'), {
		encoding: 'utf8',
	});
	const { version } = safeJsonParse(pkgJsonText, { version: '' });
	return version;
}
