import fs from 'node:fs';
import path from 'node:path';

function findFolders(root, name) {
  const results = [];
  const skip = new Set(['node_modules', '.git']);

  function walk(dir) {
    try {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const p = path.join(dir, entry.name);
        if (entry.name === name) results.push(p);
        else if (!skip.has(entry.name)) walk(p);
      }
    } catch {
      /* skip */
    }
  }

  walk(root);
  return results;
}

function remove(p) {
  try {
    fs.rmSync(p, { recursive: true, force: true });
    console.log(`Removed: ${path.relative(process.cwd(), p)}`);
  } catch (e) {
    console.error(`Failed: ${p}`, e.message);
  }
}

const root = process.cwd();
const command = process.argv[2];

if (command === 'dist') {
  findFolders(root, 'dist').forEach(remove);
} else if (command === 'deps') {
  findFolders(root, 'node_modules').forEach(remove);
} else {
  console.log('Usage: node scripts/clean.mjs [dist|deps]');
  process.exit(1);
}
