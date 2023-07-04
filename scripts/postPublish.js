const { exec } = require('child_process');
const { version } = require('../package.json');

const versionWithPrefix = `v${version}`;
exec(`git tag -a ${versionWithPrefix} -m "release ${versionWithPrefix}"`).then(
  () => {
    exec('git push origin --tags');
  }
);
