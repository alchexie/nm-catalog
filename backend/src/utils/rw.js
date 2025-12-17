const fs = require('fs');
const path = require('path');

const readText = (fileName) => {
  if (fs.existsSync(fileName)) {
    return fs.readFileSync(fileName, 'utf8');
  } else {
    return '';
  }
};

const writeText = (fileName, data) => {
  fs.writeFileSync(
    fileName,
    typeof data === 'object' ? JSON.stringify(data) : data,
    'utf8'
  );
};

module.exports = { readText, writeText };
