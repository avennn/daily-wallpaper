import fs from 'fs';
import { historyConfig } from './config';

export function saveHistoryConfig(config: Record<string, unknown>): void {
  try {
    fs.writeFileSync(historyConfig, JSON.stringify(config, null, 2));
  } catch (e) {
    console.error(e);
  }
}
