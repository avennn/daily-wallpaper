import { homedir } from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import shell from 'shelljs';
import plist from 'plist';
import { createFileIfNotExist } from '../../file';

const scriptPath = path.resolve(
  homedir(),
  './Library/LaunchAgents/com.javenleung.dwp.plist'
);
console.log('dir', scriptPath);

// function createScript() {}

export default function setStartup() {
  const xml = plist.build({
    Label: 'dwp startup',
    ProgramArguments: [],
    RunAtLoad: true,
  });
  console.log('xml', xml);
  createFileIfNotExist(scriptPath, xml);
  // shell.exec('launchctl load ');
}
