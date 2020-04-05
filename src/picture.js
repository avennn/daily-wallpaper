const fs = require('fs');
const path = require('path');
const URL = require('url');
const querystring = require('querystring');
const puppeteer = require('puppeteer');
const axios = require('axios');
const dayjs = require('dayjs');
const { website, picDir } = require('./config');

// 获取当前时刻的图片信息
async function getPictureInfo() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(website, { waitUntil: 'networkidle0' });
    const keyStr = await page.evaluate(
        () => document.getElementById('bgImgProgLoad').outerHTML,
    );
    const screenInfo = await page.evaluate(() => ({
        width: window.screen.width,
        height: window.screen.height,
    }));
    await browser.close();
    const match = keyStr.match(/data-ultra-definition-src="(.+?)&/);
    if (match) {
        const picUrl = URL.resolve(website, match[1]);
        const urlObj = URL.parse(picUrl);
        const query = querystring.parse(urlObj.query);
        const picMatch = query.id.match(/^(.+)\.(.+?)$/);
        if (picMatch) {
            return {
                url: picUrl, // example: https://cn.bing.com/th?id=OHR.FormentorHolidays_ZH-CN3392936755_UHD.jpg
                name: picMatch[1],
                ext: picMatch[2],
                screen: screenInfo,
            };
        }
    }
    return null;
}

function mkdir(dir) {
    try {
        const stats = fs.statSync(dir);
        if (!stats.isDirectory()) {
            fs.mkdirSync(dir);
        }
    } catch (e) {
        fs.mkdirSync(dir);
    }
}

exports.downloadPicture = async function downloadPicture(options = {}) {
    const { url, name, ext, screen } = await getPictureInfo();
    const { width, height } = screen;
    const params = {
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
            `./${name}.${params.w}_${params.h}.${dateStr}.${ext}`,
        );
        fs.writeFileSync(dest, res.data);
        if (options.max) {
            const files = fs.readdirSync(picDir);
            const delPics = files
                .filter(item => /(jpe?g|png|webp|gif)$/.test(item))
                .reduce((prevResult, item) => {
                    if (!prevResult.includes(item)) {
                        prevResult.push(item);
                    }
                    return prevResult;
                }, [])
                .sort((a, b) => {
                    const aList = a.split('.');
                    const bList = b.split('.');
                    const aDate = aList[aList.length - 2];
                    const bDate = bList[bList.length - 2];
                    return dayjs(bDate) - dayjs(aDate);
                })
                .splice(options.max);
            delPics.forEach(item => {
                fs.unlinkSync(path.resolve(picDir, item));
            });
        }
        console.info(
            `[${dayjs().format('YYYY-MM-DD HH:mm:ss')}]壁纸下载完成：${dest}`,
        );
    } catch (e) {
        console.warn(e);
    }
};
