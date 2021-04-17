import fs from 'fs';
import path from 'path';
import URL from 'url';
import querystring from 'querystring';
import puppeteer from 'puppeteer';
import axios from 'axios';
import dayjs from 'dayjs';
import { website, picDir } from './config';
import screen from 'nc-screen';

interface PictureInfo {
    url: string;
    name: string;
    ext: string;
}

interface DownloadOptions {
    width?: number;
    height?: number;
    max?: number;
}

// 获取当前时刻的图片信息
async function getPictureInfo(): Promise<PictureInfo | null> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(website, { waitUntil: 'networkidle0' });
    const keyStr = await page.evaluate(
        // @ts-ignore
        () => document.getElementById('bgImgProgLoad').outerHTML
    );
    const screenInfo = await page.evaluate(() => ({
        // @ts-ignore
        width: window.screen.width,
        // @ts-ignore
        height: window.screen.height,
    }));
    await browser.close();
    const match = keyStr.match(/data-ultra-definition-src="(.+?)&/);
    if (match) {
        const picUrl = URL.resolve(website, match[1]);
        const urlObj = URL.parse(picUrl);
        // @ts-ignore
        const query = querystring.parse(urlObj.query);
        // @ts-ignore
        const picMatch = query.id.match(/^(.+)\.(.+?)$/);
        if (picMatch) {
            return {
                url: picUrl, // example: https://cn.bing.com/th?id=OHR.FormentorHolidays_ZH-CN3392936755_UHD.jpg
                name: picMatch[1],
                ext: picMatch[2],
            };
        }
    }
    return null;
}

function mkdir(dir: string) {
    try {
        const stats = fs.statSync(dir);
        if (!stats.isDirectory()) {
            fs.mkdirSync(dir);
        }
    } catch (e) {
        fs.mkdirSync(dir);
    }
}

function getPictureId(name: string) {
    const arr = name.split('.');
    arr.splice(arr.length - 3);
    return arr.join('.');
}

export async function downloadPicture(options: DownloadOptions = {}) {
    const info = await getPictureInfo();
    if (!info) {
        return;
    }
    const { url, name, ext } = info;
    const { width, height } = screen.getInfo();
    const params: any = {
        rs: 1,
        c: 4,
    };
    params.w = options.width || width;
    params.h = options.height || height;
    const res = await axios.get(url, {
        params,
        responseType: 'arraybuffer',
    });
    mkdir(picDir);
    try {
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
        console.info(
            `[${dayjs().format('YYYY-MM-DD HH:mm:ss')}]壁纸下载完成：${dest}`
        );
    } catch (e) {
        console.error(e);
    }
}
