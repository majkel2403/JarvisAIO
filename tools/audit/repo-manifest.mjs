import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';

const exec = promisify(execFile);
async function git(repoDir, ...args) {
  const { stdout } = await exec('git', ['-C', repoDir, ...args], { encoding: 'buffer', maxBuffer: 16 * 1024 * 1024 });
  return stdout.toString('utf8');
}
function safeRemote(url) {
  // Never return credentials, local filesystem paths, tokens or query parameters.
  if (/^[A-Za-z]:[\\\\/]/.test(url) || url.startsWith('/') || url.startsWith('\\\\')) return '[redacted]';
  if (/^https?:\/\//i.test(url)) {
    try { const u = new URL(url); return u.hostname.toLowerCase(); } catch { return '[redacted]'; }
  }
  const ssh = url.match(/^(?:[^@\s]+@)?([\w.-]+):/);
  return ssh ? ssh[1].toLowerCase() : '[redacted]';
}
function parseStatus(raw) {
  const parts = raw.split('\0');
  const tracked_changes = [], untracked_changes = [];
  for (let i = 0; i < parts.length && parts[i]; i++) {
    const record = parts[i], code = record.slice(0, 2);
    // Report only a change type; names can contain secrets or personal paths.
    if (code === '??') untracked_changes.push({ type: 'untracked' });
    else {
      const type = /[RC]/.test(code) ? 'renamed-or-copied' : /D/.test(code) ? 'deleted' : /A/.test(code) ? 'added' : 'modified';
      tracked_changes.push({ type });
      if (/[RC]/.test(code)) i++; // porcelain -z rename has a second path field
    }
  }
  return { tracked_changes, untracked_changes };
}
export async function inspectRepository({ repoDir, includeFileHashes = true }) {
  if (!repoDir) throw new TypeError('repoDir is required');
  const dir = resolve(repoDir), errors = [];
  let git_head = null, branch = null, remotes_redacted = [], worktrees = [];
  let tracked_changes = [], untracked_changes = [];
  try { git_head = (await git(dir, 'rev-parse', 'HEAD')).trim(); } catch { errors.push('head-unavailable'); }
  try { branch = (await git(dir, 'branch', '--show-current')).trim() || '(detached)'; } catch { errors.push('branch-unavailable'); }
  try {
    const parsed = parseStatus(await git(dir, 'status', '--porcelain=v1', '-z', '--untracked-files=all'));
    tracked_changes = parsed.tracked_changes; untracked_changes = parsed.untracked_changes;
  } catch { errors.push('status-unavailable'); }
  try {
    const remoteNames = (await git(dir, 'remote')).split(/\r?\n/).filter(Boolean);
    for (const name of remoteNames) {
      try { remotes_redacted.push({ name: /^[a-zA-Z0-9_.-]+$/.test(name) ? name : '[redacted]', host: safeRemote((await git(dir, 'remote', 'get-url', name)).trim()) }); }
      catch { errors.push('remote-unavailable'); }
    }
  } catch { errors.push('remotes-unavailable'); }
  try {
    const raw = await git(dir, 'worktree', 'list', '--porcelain');
    worktrees = raw.split(/\n\s*\n/).filter(Boolean).map(entry => ({
      branch: (entry.match(/^branch refs\/heads\/(.+)$/m)?.[1] || null),
      detached: /^detached$/m.test(entry),
      // Never expose worktree paths.
      present: true
    }));
  } catch { errors.push('worktrees-unavailable'); }
  return { captured_at: new Date().toISOString(), git_head, branch, remotes_redacted, worktrees, tracked_changes, untracked_changes, status: errors.length ? 'unverified' : 'verified', errors };
}
async function cli() {
  const args = process.argv.slice(2);
  const get = key => { const i = args.indexOf(key); return i < 0 ? null : args[i + 1]; };
  const repoDir = get('--repo'), out = get('--out');
  if (!repoDir || !out) throw new Error('Usage: node repo-manifest.mjs --repo PATH --out PATH');
  const output = resolve(out);
  if (!output.split(/[\\/]/).includes('audit-private')) throw new Error('Output must be inside audit-private directory');
  const result = await inspectRepository({ repoDir });
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify(result, null, 2) + '\n', { mode: 0o600 });
  process.stdout.write('Private audit snapshot saved; status: ' + result.status + '\n');
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  cli().catch(e => { console.error(e.message); process.exitCode = 1; });
}
