/**
 * start.js — Starts both servers concurrently for LOVE MEEE
 *
 * Usage:  node start.js
 * Or:     npm start
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';
const FUCHSIA = '\x1b[35m';
const CYAN   = '\x1b[36m';
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED    = '\x1b[31m';

function prefixStream(stream, prefix, color) {
  stream.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) process.stdout.write(`${color}${BOLD}${prefix}${RESET} ${line}\n`);
    });
  });
}

console.log(`\n${FUCHSIA}${BOLD}╔═══════════════════════════════════════╗${RESET}`);
console.log(`${FUCHSIA}${BOLD}║   LOVE MEEE  —  Starting servers...   ║${RESET}`);
console.log(`${FUCHSIA}${BOLD}╚═══════════════════════════════════════╝${RESET}\n`);

// ── Download Server ───────────────────────────────────────────────────────
const dlServer = spawn('node', ['download-server.js'], {
  cwd: __dirname,
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: false,
});
prefixStream(dlServer.stdout, '[DL SERVER]', FUCHSIA);
prefixStream(dlServer.stderr, '[DL SERVER]', RED);

dlServer.on('exit', (code) => {
  console.log(`${RED}${BOLD}[DL SERVER] exited with code ${code}${RESET}`);
});

// ── Vite Dev Server (wait 2s for DL server to bind) ──────────────────────
setTimeout(() => {
  const viteServer = spawn('npx', ['vite', '--host', '0.0.0.0'], {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  });
  prefixStream(viteServer.stdout, '[VITE]     ', CYAN);
  prefixStream(viteServer.stderr, '[VITE]     ', YELLOW);

  viteServer.on('exit', (code) => {
    console.log(`${RED}${BOLD}[VITE] exited with code ${code}${RESET}`);
  });

  console.log(`${GREEN}${BOLD}Both servers starting! Open http://localhost:5173 in your browser.${RESET}\n`);
}, 2000);

// ── Graceful shutdown ─────────────────────────────────────────────────────
process.on('SIGINT', () => {
  console.log(`\n${YELLOW}Shutting down servers...${RESET}`);
  process.exit(0);
});
