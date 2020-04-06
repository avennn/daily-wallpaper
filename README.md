# daily-wallpaper

Auto fetch Bing's wallpaper at regular intervals.

## Installation

```bash
npm i -g dwp
```

or

```bash
yarn global add dwp
```

## Usage

For example

```bash
dwp start --width=2880 --height=1800
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

-   set the width of wallpaper, if not explicit, use screen's width as default.

`--height`

-   set the height of wallpaper, if not explicit, use screen's height as default.

`--max`

-   set the maximum count of wallpapers keeping in local.

`--interval`

-   set the interval of fetching wallpaper, every 12 hours as default.

## Todo List

-   add more fetch modes.
-   support windows system.
-   not depend on nodejs environment.

## Issues and Contributing

Welcome to publish an issue if you have any question, further more, you can contribute your code if you have good ideas.

## Author

[Javen Leung](https://github.com/avennn)，a front-end coder based in ShenZhen.

## License

[MIT](./LICENSE)
