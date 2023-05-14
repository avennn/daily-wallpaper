import fs from 'fs';
import path from 'path';
import { URL, URLSearchParams } from 'url';
import puppeteer from 'puppeteer';
import axios from 'axios';
import dayjs from 'dayjs';

import { website, picDir } from './config';
import { createDirIfNotExist } from './file';
import { logger } from './logger';

export interface PictureInfo {
  url: string;
  name: string;
  ext: string;
}

interface BaseResult {
  success: boolean;
  errorMsg: string;
  errorStack: string;
}

interface PictureInfoResult extends BaseResult {
  data?: PictureInfo;
}

interface DownloadOptions {
  width?: number;
  height?: number;
  max?: number;
}

interface DownloadInfo {
  originalUrl?: string;
  destPath?: string;
}

interface DownloadPictureResult extends BaseResult {
  data?: DownloadInfo;
}

/**
 * @returns https://s.cn.bing.net/th?id=OHR.OdocoileusVirginianus_ZH-CN6941501455_1920x1080.webp&qlt=50
 */
export async function crawlPicture(): Promise<string> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(website, { waitUntil: 'networkidle0' });
  const linkEle = await page.evaluate(
    () => document.getElementById('preloadBg')?.outerHTML
  );
  await browser.close();
  if (!linkEle || typeof linkEle !== 'string') {
    throw new Error(`<link> for background image doesn't exist!`);
  }
  const matched = linkEle.match(/href="(.+?)"/);
  if (matched) {
    return matched[1];
  }
  return '';
}

// 获取当前时刻的图片信息
export async function getPictureInfo(): Promise<PictureInfoResult> {
  try {
    const pictureUrl = await crawlPicture();
    if (pictureUrl) {
      const urlObj = new URL(pictureUrl);
      const id = urlObj.searchParams.get('id') || '';
      const name = id
        .replace(/(?<=_)(\d+x\d+)(?=\.)/, 'UHD')
        .replace(/(?<=\.)(webp)$/, 'jpg');
      const newSearchParams = new URLSearchParams({
        id: name,
      });
      const newUrlObj = new URL(
        urlObj.pathname + '?' + newSearchParams.toString(),
        urlObj.origin
      );
      const picUrl = newUrlObj.toString();
      const ext = name.substring(name.lastIndexOf('.') + 1);
      logger.info('Picture base url: ', picUrl);
      return {
        success: true,
        data: {
          url: picUrl, // example: https://s.cn.bing.net/th?id=OHR.FormentorHolidays_ZH-CN3392936755_UHD.jpg
          name, // with suffix such as .jpg,.png
          ext,
        },
        errorMsg: '',
        errorStack: '',
      };
    } else {
      throw new Error('Not Match!');
    }
  } catch (e: unknown) {
    logger.error('Get picture url error:\n', e);
    return {
      success: false,
      // @ts-ignore
      errorMsg: e?.message,
      errorStack: '',
    };
  }
}

function getPictureId(name: string) {
  const arr = name.split('.');
  arr.splice(arr.length - 3);
  return arr.join('.');
}

export async function downloadPicture(
  options: DownloadOptions = {}
): Promise<DownloadPictureResult> {
  try {
    const picResult = await getPictureInfo();
    if (!picResult.success || !picResult.data) {
      return {
        success: false,
        errorMsg: picResult.errorMsg,
        errorStack: picResult.errorStack,
      };
    }
    const { url, name, ext } = picResult.data;
    const params: Record<string, unknown> = {
      rs: 1,
      c: 4,
    };
    params.w = options.width;
    params.h = options.height;
    const res = await axios.get(url, {
      params,
      responseType: 'arraybuffer',
    });
    createDirIfNotExist(picDir);
    const dateStr = dayjs().format('YYYYMMDD');
    const dest = path.resolve(
      picDir,
      `./${name}.${params.w}_${params.h}.${dateStr}.${ext}`
    );
    fs.writeFileSync(dest, res.data);
    if (options.max) {
      const files = fs.readdirSync(picDir);
      const delPics = files
        .filter((item) => /(jpe?g|png|webp|gif)$/.test(item))
        .reduce((prevResult, item) => {
          if (
            !prevResult
              .map((prevItem) => getPictureId(prevItem))
              .includes(getPictureId(item))
          ) {
            prevResult.push(item);
          }
          return prevResult;
        }, [] as string[])
        .sort((a, b) => {
          const aList = a.split('.');
          const bList = b.split('.');
          const aDate = aList[aList.length - 2];
          const bDate = bList[bList.length - 2];
          // @ts-ignore
          return dayjs(bDate) - dayjs(aDate);
        })
        .splice(options.max);
      delPics.forEach((item) => {
        fs.unlinkSync(path.resolve(picDir, item));
      });
    }
    logger.info('Download success: ', dest);
    const urlObj = new URL(url);
    Object.keys(params).forEach((key) => {
      urlObj.searchParams.set(key, String(params[key]));
    });
    return {
      success: true,
      data: {
        originalUrl: urlObj.toString(),
        destPath: dest,
      },
      errorMsg: '',
      errorStack: '',
    };
  } catch (e: unknown) {
    logger.error('Download fail: ', e);
    return {
      success: false,
      // @ts-ignore
      errorMsg: e?.message,
      // @ts-ignore
      errorStack: e?.stack,
    };
  }
}
