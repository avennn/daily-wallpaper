import fs from 'node:fs/promises';
import path from 'node:path';
import dirname from '@/system/dirname';

export default async function getAppVersion() {
	const pkgJsonText = await fs.readFile(path.join(dirname(import.meta.url), '../../package.json'), {
		encoding: 'utf8',
	});
	try {
		const { version } = JSON.parse(pkgJsonText);
		return version;
	} catch (e) {
		return '';
	}
}
