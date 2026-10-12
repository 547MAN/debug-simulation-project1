import { spawn } from 'node:child_process';

const processes = [];
let stopping = false;

function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = exitCode;
  for (const child of processes) {
    if (child.exitCode === null && !child.killed) child.kill('SIGTERM');
  }
}

function run(label, command, args, extraEnv = {}) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, ...extraEnv }
  });
  processes.push(child);
  child.on('error', (error) => {
    console.error('[' + label + '] Could not start: ' + error.message);
    stop(1);
  });
  child.on('exit', (code, signal) => {
    if (stopping) return;
    console.error('[' + label + '] stopped (' + (signal || 'exit ' + code) + ').');
    stop(code === 0 ? 0 : code || 1);
  });
}

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));

console.log('Starting the shop API and storefront...');
console.log('Storefront: http://127.0.0.1:5173');
console.log('API:        http://127.0.0.1:5080');
console.log('Press Ctrl+C to stop both processes.\n');

run('api', 'dotnet',
  ['run', '--project', 'backend/Shop.Api/Shop.Api.csproj', '--no-launch-profile'],
  { ASPNETCORE_URLS: 'http://127.0.0.1:5080' }
);
run('web', process.platform === 'win32' ? 'npm.cmd' : 'npm',
  ['run', 'dev', '--prefix', 'frontend']
);
