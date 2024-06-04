# 批量网页截图

提供一个 Excel 格式的 URL 列表，批量截取网页截图。

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
* --name: 输出的 xlsx 文件名，默认是 `pages`，自动添加 `.xlsx` 扩展名。

### 示例

```
node index.js demo.xlsx demo
node index.js demo.xlsx demo --concurrency 2 --delay 4 --name demo
```

## 输入 Excel 文件格式

第一列是要生成截图的文件名，第二列是 URL

## 输出 Excel 文件格式

与输入相同，但是第一列的文件名会链接到与输出 Excel 文件同目录下的截图文件
