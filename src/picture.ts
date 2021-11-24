import fs from 'fs';
import path from 'path';
import { URL, URLSearchParams } from 'url';
import puppeteer from 'puppeteer';
import axios from 'axios';
import dayjs from 'dayjs';

import { website, picDir } from './config';
import { createDirIfNotExist } from './file';
import logger from './logger';

interface PictureInfo {
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

// 获取当前时刻的图片信息
export async function getPictureInfo(): Promise<PictureInfoResult> {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(website, { waitUntil: 'networkidle0' });
        const keyStr = await page.evaluate(
            // @ts-ignore
            () => document.getElementById('preloadBg').outerHTML
        );
        await browser.close();
        if (!keyStr || typeof keyStr !== 'string') {
            throw new Error('Element not exist!');
        }
        const match = keyStr.match(/href="(.+?)"/);
        if (match) {
            const urlObj = new URL(match[1], website);
            const id = urlObj.searchParams.get('id') || '';
            const picMatch = id.match(/^(.+)\.(.+?)$/);
            if (picMatch) {
                const picName = id.replace(/\d*x\d*/, 'UHD');
                const searchParams = new URLSearchParams({
                    id: picName,
                });
                const newUrlObj = new URL(
                    urlObj.pathname + '?' + searchParams.toString(),
                    urlObj.origin
                );
                const picUrl = newUrlObj.toString();
                logger.info('Picture base url: ', picUrl);
                return {
                    success: true,
                    data: {
                        url: newUrlObj.toString(), // example: https://cn.bing.com/th?id=OHR.FormentorHolidays_ZH-CN3392936755_UHD.jpg
                        name: picName,
                        ext: picMatch[2],
                    },
                    errorMsg: '',
                    errorStack: '',
                };
            }
        }
        throw new Error('Not Match!');
    } catch (e: any) {
        logger.error('Get picture url error:\n', e);
        return {
            success: false,
            errorMsg: e.message,
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
        if (!picResult.success) {
            return {
                success: false,
                errorMsg: picResult.errorMsg,
                errorStack: picResult.errorStack,
            };
        }
        const { url, name, ext } = picResult.data!;
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
    } catch (e: any) {
        logger.error('Download fail: ', e);
        return {
            success: false,
            errorMsg: e.message,
            errorStack: e.stack,
        };
    }
}
