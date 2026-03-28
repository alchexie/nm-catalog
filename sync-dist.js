const { mkdirSync, cpSync, rmSync, writeFileSync } = require('fs');

const serverItems = [
  { src: 'apps/backend', dest: 'server/apps/backend' },
  { src: 'packages/core', dest: 'server/packages/core' },
  { src: 'packages/shared', dest: 'server/packages/shared' },
  { src: 'tools/scripts', dest: 'server/tools/scripts' },
];
for (const { src, dest } of serverItems) {
  const targetDir = `dist/${dest}`;
  mkdirSync(targetDir, { recursive: true });
  cpSync(`${src}/dist`, `${targetDir}/dist`, { recursive: true });
  cpSync(`${src}/package.json`, `${targetDir}/package.json`);
}

cpSync('pnpm-workspace.yaml', 'dist/server/pnpm-workspace.yaml');
writeFileSync(
  'dist/server/package.json',
  JSON.stringify({ name: 'nm-catalog-server', private: true }, null, 2)
);

mkdirSync('dist/web', { recursive: true });
cpSync('apps/frontend/dist', 'dist/web', { recursive: true });
rmSync('apps/frontend/dist', { recursive: true, force: true });

console.log('√ All dist synced');
