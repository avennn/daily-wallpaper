const { exec } = require('child_process');
const { version } = require('../package.json');

const versionWithPrefix = `v${version}`;
exec(`git tag -a ${versionWithPrefix} -m "release ${versionWithPrefix}"`).then(
  () => {
    console.log(
      `Taged with ${versionWithPrefix}.\n`,
      'You can manually run "git push origin --tags" to commit all tags to origin.'
    );
  }
);
