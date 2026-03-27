const { mkdirSync, cpSync, rmSync } = require('fs');

const serverItems = [
  { name: 'backend', src: 'apps/backend' },
  { name: 'shared', src: 'packages/shared' },
];

for (const { name, src } of serverItems) {
  const targetDir = `dist/server/${name}`;
  mkdirSync(targetDir, { recursive: true });
  cpSync(`${src}/dist`, `${targetDir}/dist`, { recursive: true });
  cpSync(`${src}/package.json`, `${targetDir}/package.json`);
  if (name !== 'shared') {
    rmSync(`${src}/dist`, { recursive: true, force: true });
  }
}

mkdirSync('dist/web', { recursive: true });
cpSync('apps/frontend/dist', 'dist/web', { recursive: true });
rmSync('apps/frontend/dist', { recursive: true, force: true });

console.log('√ All dist synced');
