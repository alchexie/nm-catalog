const fs = require('fs');
const path = require('path');

module.exports = {
  readText: (fileName) => {
    const filePath = path.join(__dirname, '../files', fileName);
    return fs.readFileSync(filePath, 'utf8');
  },
  writeText: (fileName, data) => {
    const filePath = path.join(__dirname, '../files', fileName ?? 'data.json');
    fs.writeFileSync(filePath, JSON.stringify(data), 'utf8');
  },
};
