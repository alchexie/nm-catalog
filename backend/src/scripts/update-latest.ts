import { spawn } from 'child_process';

const runCommand = (exec: string) => {
  const execParts = exec.split(' ');
  const [cmd, ...args] = execParts;

  return new Promise<void>((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'pipe', shell: true });

    child.stdout.on('data', (data) => {
      const text = data.toString();
      process.stdout.write(text);
      if (text.includes('STOP')) {
        child.kill();
        process.exit(0);
      }
    });

    child.stderr.on('data', (data) => process.stderr.write(data.toString()));

    child.on('close', (code) => {
      if (code !== 0) reject(new Error(`${cmd} exited with ${code}`));
      else resolve();
    });
  });
};

(async () => {
  await runCommand('npm run pull-game');
  await runCommand('npm run pull-playlist');
  await runCommand('npm run get-img -- original');
  // await runCommand('npm run pull-playlist -- section after-update-latest');
})();
