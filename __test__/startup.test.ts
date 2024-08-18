import setStartup from '../src/startup/mac/index';

describe('startup', () => {
  test('create plist script in mac', () => {
    setStartup();
  });
});
