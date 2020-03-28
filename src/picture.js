const fs = require('fs');
const path = require('path');
const URL = require('url');
const querystring = require('querystring');
const puppeteer = require('puppeteer');
const axios = require('axios');
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

function getCurrentDate() {
    const date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    if (month < 10) {
        month = '0' + month;
    }
    let day = date.getDate();
    if (day < 10) {
        day = '0' + day;
    }
    return `${year}${month}${day}`;
}

exports.downloadPicture = async function downloadPicture(queryObj = {}) {
    const { url, name, ext, screen } = await getPictureInfo();
    const { width, height } = screen;
    const params = {
        w: width,
        h: height,
        c: 4, // clip裁剪不留白边
        ...queryObj,
    };
    const res = await axios.get(url, {
        params,
        responseType: 'arraybuffer',
    });
    mkdir(picDir);
    try {
        const dateStr = getCurrentDate();
        const dest = path.resolve(
            picDir,
            `./${name}.${params.w}_${params.h}.${dateStr}.${ext}`,
        );
        fs.writeFileSync(dest, res.data);
        console.info(`壁纸下载完成：${dest}`);
    } catch (e) {
        console.warn(e);
    }
};
