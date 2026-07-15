import { runCommand } from './utils/runCommand.js';

(async () => {
  await runCommand(`pnpm backup-db`);
  await runCommand(`pnpm pull-playlist -- order`);
  await runCommand(`pnpm pull-playlist -- character`);
  await runCommand(`pnpm vacuum-db`);
})();
