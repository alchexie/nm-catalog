const { mkdirSync, cpSync } = require('fs');

const folders = ['backend', 'frontend', 'shared'];

for (const folder of folders) {
  mkdirSync(`dist/${folder}`, { recursive: true });
  cpSync(`${folder}/dist`, `dist/${folder}`, { recursive: true });
}

console.log('√ All dist synced to root dist');
