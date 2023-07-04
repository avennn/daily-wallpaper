const util = require('node:util');
const { exec: execLegacy } = require('child_process');
const { version } = require('../package.json');

const exec = util.promisify(execLegacy);

const versionWithPrefix = `v${version}`;
exec(`git tag -a ${versionWithPrefix} -m "release ${versionWithPrefix}"`).then(
  () => {
    exec('git push origin --tags');
  }
);
