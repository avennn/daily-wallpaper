import path from 'node:path';
import { fileURLToPath } from 'node:url';

export default function dirname(importMetaUrl: string) {
	return path.dirname(fileURLToPath(importMetaUrl));
}
