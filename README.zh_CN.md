<a href="README.md">English</a>｜<a href="README.zh_CN.md">简体中文</a>

# daily-wallpaper

一个定时抓取必应壁纸的 nodejs 命令行工具

## 安装

```sh
npm install -g dwp
```

或者

```sh
yarn global dwp
```

## 用法

开始定时任务

```sh
dwp start
```

停止所有定时任务

```sh
dwp stop
```

查看任务列表

```sh
dwp list
```

### 选项

-   `-v, --version`

    显示当前版本

-   `-h, --help`

    显示帮助信息

### `start`命令的选项

-   `-W, --width <number>`

    设置壁纸的宽度。非必需。`width`和`height`会通过[nc-screen](https://github.com/avennn/nc-screen)自动获取。

-   `-H, --height <number>`

    设置壁纸的高度。非必需。

-   `-i, --interval <string>`

    两次抓取壁纸的间隔时间，格式是`[digit][unit]`。例如，`1h` 代表 1 小时获取一次. 单位支持`s`(秒), `m`(分), `h`(时), `d`(天)。默认 1 天一次。不建议设置太小的值，否则很可能出现 bug。

-   `-m, --max <number>`

    最多保留最近`max`张壁纸在文件夹中。 默认 `3`。

-   `-s, --startup`

    电脑启动后自动运行定时任务。计划支持。

-   `--no-startup`
    电脑启动后不自动运行定时任务。计划支持。

## 问题和贡献

如果你有任何问题，请联系我。欢迎提 issue 或者贡献代码。

## 作者

[Javen Leung](https://github.com/avennn)

## 证书

[MIT](./LICENSE)
