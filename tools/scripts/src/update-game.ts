import { isUuid } from '@nm-catalog/core';
import { runCommand } from './utils/runCommand.js';

const args = process.argv.slice(2);
const gid = args[1];
if (!isUuid(gid)) {
  console.log('Please input a correct game id.');
  process.exit(0);
}

(async () => {
  await runCommand(`pnpm backup-db`);
  await runCommand(`pnpm pull-game -- ${gid}`);
  await runCommand(`pnpm pull-playlist -- ${gid}`);
  await runCommand(`pnpm get-img -- original`);
  await runCommand(`pnpm vacuum-db`);
})();
