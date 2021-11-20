# daily-wallpaper

Auto fetch Bing's wallpaper at regular interval.

## Installation

```
$ npm install -g dwp
# or
$ yarn global add dwp
```

## Usage

Simplest example

```bash
dwp start
```

You can stop the job by runing this

```bash
dwp stop
```

To find out whether or not the job is runing, you can run this

```bash
pm2 ls
```

or

```bash
pm2 logs
```

### Options

`-v, --version`

-   show this package's version.

`-h, --help`

-   show all the options you can use.

`--width`

-   set the width of wallpaper, if not explicit, use screen's width as default. For example: `--width 1920`, get default value by [nc-screen](https://github.com/avennn/nc-screen).

`--height`

-   set the height of wallpaper, if not explicit, use screen's height as default. For example: `--height 1080`, get default value by [nc-screen](https://github.com/avennn/nc-screen).

`--max`

-   set the maximum count of wallpapers keeping in local. For example: `--max 3`, default: `1`.

`--interval`

-   set the interval of fetching wallpaper, every 12 hours as default. For example: `--interval 6h`, default: `12h`.

`--startup`

-   auto launch after your computer started up.

`--no-startup`

-   not auto launch after your computer started up.

`--history`

-   use last params as input.

`--no-history`

-   not use last params as input.

## Issues and Contributing

Welcome to publish an issue if you have any question, further more, you can contribute your code if you have good ideas.

## Author

[Javen Leung](https://github.com/avennn)

## License

[MIT](./LICENSE)

## problems

-   https://stackoverflow.com/questions/40317578/yarn-global-command-not-working
-   puppeteer is brittle, don't set low interval.
