const { mkdirSync, cpSync } = require('fs');

const folders = ['backend', 'frontend', 'shared'];

for (const folder of folders) {
  const targetDir = `dist/${folder}`;
  mkdirSync(targetDir, { recursive: true });

  if (folder === 'frontend') {
    cpSync(`${folder}/dist`, targetDir, { recursive: true });
  } else {
    cpSync(`${folder}/dist`, `${targetDir}/dist`, { recursive: true });
    cpSync(`${folder}/package.json`, `${targetDir}/package.json`);
  }
}

console.log('√ All dist synced to root dist');
