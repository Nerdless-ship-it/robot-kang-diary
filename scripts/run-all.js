#!/usr/bin/env node

const { spawnSync } = require('child_process');
const path = require('path');

const PROJECT_DIR = path.resolve(__dirname, '..');

const steps = [
  { name: 'wisdom', command: 'node', args: [path.join(__dirname, 'daily-wisdom.js')] },
  { name: 'heatmap', command: 'node', args: [path.join(__dirname, 'generate-heatmap.js')] },
  { name: 'build-site', command: 'node', args: [path.join(__dirname, 'build.js')] }
];

console.log('========================================');
console.log('Robot康 unified auto pipeline');
console.log('========================================');
console.log('');

for (const [index, step] of steps.entries()) {
  console.log(`[${index + 1}/${steps.length}] Running ${step.name}...`);
  const result = spawnSync(step.command, step.args, {
    cwd: PROJECT_DIR,
    stdio: 'inherit',
    shell: false
  });

  if (result.status !== 0) {
    console.error('');
    console.error(`[ERROR] Step failed: ${step.name}`);
    process.exit(result.status || 1);
  }

  console.log('');
}

console.log('========================================');
console.log('[OK] Auto pipeline finished');
console.log('========================================');
