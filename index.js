import { join } from 'node:path';
import { mkdirSync } from 'node:fs';
import minimist from 'minimist';
import Pageres from 'pageres';
import Excel from 'exceljs';
import PQueue from 'p-queue';

const argv = minimist(process.argv.slice(2), {
  string: ['_'],
});

const sourceFilename = argv._[0];
const destPath = argv._[1];

const concurrency = argv.concurrency || 5;
const delay = argv.delay || 2;
const destFilename = argv.name || 'pages';

if (argv._.length < 2) {
  console.log('用法: node index.js <源 xlsx 文件> <目标目录>');
  process.exit(1);
}

mkdirSync(destPath, { recursive: true });

const workbookSource = new Excel.Workbook();
const worksheetsSource = await workbookSource.xlsx.readFile(sourceFilename);
const worksheetSource = worksheetsSource.getWorksheet(worksheetsSource.worksheets[0].id);

const workbookDest = new Excel.Workbook();
workbookDest.creator = 'NodeJS';
workbookDest.lastModifiedBy = 'NodeJS';
workbookDest.created = new Date();
workbookDest.modified = new Date();
workbookDest.lastPrinted = new Date();

const worksheetDest = workbookDest.addWorksheet('网页表');

worksheetDest.columns = [
  {
    key: 'title',
    header: '标题',
    width: 100,
  },
  {
    key: 'url',
    header: 'URL',
    width: 100,
  },
];

worksheetDest.getCell('A1').font = { bold: true };
worksheetDest.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
worksheetDest.getCell('B1').font = { bold: true };
worksheetDest.getCell('B1').alignment = { vertical: 'middle', horizontal: 'center' };

const dataToProcess = [];

const getCellText = (value) => {
  if (typeof value === 'object') {
    if (value.richText) {
      return value.richText.map((item) => item.text).join('').trim();
    }
    else if (value.text) {
      return value.text.trim();
    }
    else {
      return '';
    }
  }

  return value.trim();
};

worksheetSource.eachRow((row) => {
  const text = row.values[1];
  const url = row.values[2];

  dataToProcess.push({
    url: getCellText(url),
    text: getCellText(text),
  });
});

const queue = new PQueue({ concurrency });

queue.on('idle', async () => {
	await workbookDest.xlsx.writeFile(join(destPath, `${destFilename}.xlsx`));
});

dataToProcess.forEach((item) => {
	queue.add(() => {
    console.log(`Do: "${item.text}"`);

    return new Pageres({
      launchOptions: {
        headless: 'new',
        timeout: 1000 * 60 * 5,
      },
      delay,
      filename: `${item.text.replace(/\/|\\/g, '-').replace(/\n|\r\n|\r/g, '')}`,
    }).source(item.url, ['1920x1080']).destination(destPath).run().then((result) => {
      worksheetDest.addRow([
        { text: item.text, hyperlink: `${result[0].filename}` },
        item.url,
      ]).commit();
      console.log(`Done: "${result[0].filename}"`);
    }).catch((error) => {
      console.log(`Error: "${item.url}" "${item.text}" "${error}"`);
    });
  });
});
