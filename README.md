<a href="README.md">English</a>｜<a href="README.zh_CN.md">简体中文</a>

# daily-wallpaper

[![Download](https://img.shields.io/npm/dw/dwp)](https://www.npmjs.com/package/dwp)
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)](https://github.com/avennn/daily-wallpaper)
[![Npm](https://img.shields.io/npm/v/dwp)](https://github.com/avennn/daily-wallpaper)
[![Node](https://img.shields.io/node/v/dwp)](./package.json)
[![License](https://img.shields.io/npm/l/dwp)](./LICENSE)

A nodejs cli tool for fetching Bing wallpapers regularly

## Installation

```sh
npm install -g dwp
```

or

```sh
yarn global add dwp
```

## Usage

Start a cron job.

```bash
dwp start
```

Stop all cron jobs.

```bash
dwp stop
```

Show cron jobs.

```sh
dwp list
```

Show logs.

```sh
dwp log
```

### Options

- `-v, --version`

  Show current version.

- `-h, --help`

  Show help info.

### Options for `start` command

- `-W, --width <number>`

  Set wallpaper's width. Not required. `width` and `height` would be automatically acquired with [nc-screen](https://github.com/avennn/nc-screen).

- `-H, --height <number>`

  Set wallpaper's height. Not required.

- `-i, --interval <string>`

  Interval between two fetching actions, with format `[digit][unit]`. For example, `1h` means fetching wallpaper per hour. Unit supports `s`(second), `m`(minute), `h`(hour), `d`(day). Default `1d`. Not suggest to set a very small value, otherwise leading problem.

- `-m, --max <number>`

  Keep latest `max` wallpapers in the directory. Default `3`.

- `-s, --startup`

  Auto start after your computer launched. Plan to support.

- `--no-startup`
  Not auto start after your computer launched. Plan to support.

### Options for `log` command

- `-n, --num <number>`

  How many rows of log will be shown. Default `500`.

- `-e, --error`

  Show logs with a log level upper than `error`.

## Issues and Contributing

Please contact with me if you have any question. Welcome to confirm an issue or contribute.

## Author

[Thomas Leung](https://github.com/avennn)

## License

[MIT](./LICENSE)
