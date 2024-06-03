# 批量网页截图演示项目

## 安装依赖

```
pnpm i
```

## 用法

```
node index.js <源 xlsx 文件> <目标目录> --concurrency 并发数 --delay 延迟秒数 --name 输出文件名
```

* --concurrency: 并发数，默认是 5
* --delay: 延迟多少秒截图，默认 2 秒
* --name: 输出的 xlsx 文件名，默认是 `main`，自动添加 `.xlsx` 扩展名。

## 示例用法

```
node index.js input.xlsx dest
node index.js input.xlsx dest --concurrency 2 --delay 4 --name my
```
