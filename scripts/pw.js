/**
 * Lightweight Playwright runner that supports profile-based filtering.
 *
 * Usage examples:
 *   node scripts/pw.js tests/job-posting/job-posting-regression.spec.ts --headed --profile=hr
 *   node scripts/pw.js tests/job-posting --grep "@Regression" --profile admin
 *
 * This sets process.env.PROFILE_FILTER for the Playwright process, so existing
 * profile filtering logic in specs/fixtures can remain unchanged.
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const out = [];
  let profile;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];

    if (a === '--profile' || a === '--PROFILE' || a === '--profile-filter') {
      profile = argv[i + 1];
      i++;
      continue;
    }

    if (a.startsWith('--profile=')) {
      profile = a.slice('--profile='.length);
      continue;
    }

    if (a.startsWith('--profile-filter=')) {
      profile = a.slice('--profile-filter='.length);
      continue;
    }

    out.push(a);
  }

  return { profile, args: out };
}

const { profile, args } = parseArgs(process.argv.slice(2));
if (profile) process.env.PROFILE_FILTER = String(profile).trim();

/**
 * Help users who run `npm run <script> --grep "..."` without `--`.
 * In that case npm often strips the flag and only forwards the value(s),
 * which Playwright then interprets as test file patterns -> "No tests found."
 */
function warnIfLikelyMissingNpmDoubleDash(pwArgs) {
  // If grep is explicitly present, this is likely intentional.
  if (pwArgs.some((a) => a === '--grep' || a === '-g' || (typeof a === 'string' && a.startsWith('--grep=')))) {
    return;
  }

  const positionals = pwArgs.filter((a) => typeof a === 'string' && a.length > 0 && !a.startsWith('-'));
  if (positionals.length === 0) return;

  // If any positional looks like it was meant to be a grep/title (not a path)
  // and doesn't exist on disk, it's very likely the user forgot `--` after `npm run ...`.
  const repoRoot = path.resolve(__dirname, '..');
  const suspicious = positionals.filter((p) => {
    const looksLikePath = p.includes('/') || p.includes('\\') || p.includes('.') || p.includes(':');
    if (looksLikePath) return false;

    const abs = path.resolve(repoRoot, p);
    return !fs.existsSync(abs);
  });

  if (suspicious.length === 0) return;

  // Only warn (don’t exit) — Playwright will still decide what to do.
  console.warn('\n⚠️  It looks like you passed a grep/title without npm’s `--` separator.');
  console.warn('   npm may strip flags like `--grep`, leaving only the value which Playwright treats as a file pattern.');
  console.warn('   Use:');
  console.warn('     npm run <script> -- --grep "HR Profile" --headed\n');
}

warnIfLikelyMissingNpmDoubleDash(args);

// Use local Playwright via npx (works cross-platform).
// On Windows, spawning `npx.cmd` directly can throw EINVAL in some environments,
// so we run via a shell.
const npxCmd = 'npx';

// Allow `--version` passthrough (Playwright supports it on the top-level command).
const isVersionOnly = args.length === 1 && args[0] === '--version';
const playwrightArgs = isVersionOnly
  ? ['playwright', '--version']
  : ['playwright', 'test', ...args];

const child = spawn(npxCmd, playwrightArgs, {
  stdio: 'inherit',
  env: process.env,
  cwd: path.resolve(__dirname, '..'),
  shell: process.platform === 'win32',
});

child.on('exit', (code, signal) => {
  if (signal) process.exit(1);
  process.exit(code ?? 1);
});





















