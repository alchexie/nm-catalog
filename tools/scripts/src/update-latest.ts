import { runCommand } from './utils/runCommand.js';

(async () => {
  await runCommand(`pnpm backup-db`);
  await runCommand('pnpm pull-game');
  await runCommand('pnpm pull-playlist');
  await runCommand('pnpm pull-playlist -- section');
  await runCommand('pnpm get-img -- original');
  await runCommand('pnpm set-series', true);
  await runCommand(`pnpm vacuum-db`);
})();
