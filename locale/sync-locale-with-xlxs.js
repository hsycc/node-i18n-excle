const fs = require('fs');
const xlsx = require('node-xlsx');
const config = require('./locale-config.js')
const keyMap = config.keyMap;

var p = process.argv[2];
// define things
var direction = p ? p : "pull"

// 读取excle文件
const readXlxs = function (src) {
  if (!src) {
    console.log('xlsx is no found');
    return;
  }
  const sheets = xlsx.parse(src);
  if (sheets) {
    console.log("read excle succeseful.");
  }
  return sheets;
}

// 写入excle文件
const writeXlsx = function (data) {
  const buffer = xlsx.build(data);
  // 写入文件
  fs.writeFile(config.entrySrc, buffer, function (err) {
    if (err) {
      console.log("Write excle failed: " + err);
      return;
    }
    console.log("Write excle completed.");
  });
}

// 写入js文件
const writeCopyWrite = function (data) {

  fs.writeFile(config.outputSrc, "// @ts-nocheck \n window.copyWrite = " + JSON.stringify(data, null, '  '), function (err) {
    if (err) {
      return console.log(err)
    }
    console.log("\n'" + config.outputSrc + "' update success!\n\n")
  })
}

// 读取js文件
const readCopyWrite = function () {
  let text = fs.readFileSync(config.outputSrc,'utf-8');
  text = text.replace(/\/\/ @ts-nocheck \n window.copyWrite = /, '')
  const data = JSON.parse(text);
  return data;
}


const xlsxToJs = function () {
  const data = {};
  const xlsx = readXlxs(config.entrySrc);
  xlsx.forEach(function (sheet) {
    // 读取每行内容
    for (const rowId in sheet['data']) {
      const row = sheet['data'][rowId];
      if (rowId === '0') continue;
      // @ts-ignore
      const key = row['0'];
      data[key] = {};
      keyMap.forEach((k, i) => {
        data[key][k] = row[i]
      })
    }
  });
  const jsData = readCopyWrite()
  writeCopyWrite(Object.assign({},jsData,data))
}

const jsToXlsx = function () {
  const xlsx = [];
  const jsData = readCopyWrite();
  Object.keys(jsData).forEach((k,i)=> {
    xlsx[i] = []
    xlsx[i].push(k)
    for (const v in jsData[k]) {
      xlsx[i].push(jsData[k][v]);
    }
  });
  xlsx.unshift(['key', ...keyMap]);
  const data = [{
    data: xlsx
  }]
  writeXlsx(data);
}


// sync
try {

  switch (direction) {
    case "pull":
      console.log("\n\nStart Syncing pull xlsxToJs ...")
      xlsxToJs();
      break;
    case "push_im_sure":
      console.log("\n\nStart Syncing push_im_sure jsToXlsx...")
      jsToXlsx();
      break;
    case "--help":
    case "-h":
        console.log("\nsync-locale-with-excle ... \n")
        console.log("Usage:")
        console.log("node sync-locale-with-excle [push_im_sure|pull]\n")
      break
  }
} catch (e) {
  console.error("Sync error: " + e)
}