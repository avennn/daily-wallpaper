import getAppVersion from './getAppVersion';

describe('getAppVersion', () => {
	test('can get app verion', async () => {
		const version = await getAppVersion();
		expect(version).toEqual(expect.stringMatching(/^\d+\.\d+\.\d+$/));
	});
});
