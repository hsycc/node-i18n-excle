
const path = require('path');
console.log(path.resolve(__dirname, '../entry/工作簿1.xlsx'));
module.exports = {
  entrySrc: path.resolve(__dirname,'../entry/工作簿1.xlsx'),
  outputSrc: path.resolve(__dirname, '../output/copytWrite.js'),
  keyMap: ["zh", "en", 'desc']
}