import { URL } from 'url';
import { crawlPicture, getPictureInfo, PictureInfo } from '../src/picture';

// jest.setTimeout(10000);

describe('picture', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  test('crawl picture successfully', async () => {
    const url = await crawlPicture();
    expect(url).toBeTruthy();
  }, 10000);
  test('url of crawled picture contains an id parameter', async () => {
    // https://s.cn.bing.net/th?id=OHR.OdocoileusVirginianus_ZH-CN6941501455_1920x1080.webp&qlt=50
    const url = await crawlPicture();
    const urlObj = new URL(url);
    const id = urlObj.searchParams.get('id');
    expect(id).toBeTruthy();
  }, 10000);
  test('getPictureInfo returns correct properties', async () => {
    const { success, data } = await getPictureInfo();
    expect(success).toBe(true);
    expect(data).toBeTruthy();
    const { url, name, ext } = data as PictureInfo;
    const urlObj = new URL(url);
    const id = urlObj.searchParams.get('id');
    expect(id).toMatch(/.+UHD\..+$/);
    expect(name).toEqual(expect.stringMatching(/\.(jpg|jpeg|png|svg|gif)$/));
    expect(ext).not.toBe('webp');
  }, 10000);
});
