import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { inspectRepository } from '../../tools/audit/repo-manifest.mjs';

function git(dir, ...args) { return execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8' }); }
async function fixture(fn) {
  const dir = await mkdtemp(join(tmpdir(), 'jarvisaio-audit-'));
  try {
    git(dir, 'init'); git(dir, 'config', 'user.email', 'fixture@example.org'); git(dir, 'config', 'user.name', 'Fixture');
    await writeFile(join(dir, 'plik ł.txt'), 'initial\n');
    git(dir, 'add', '.'); git(dir, 'commit', '-m', 'fixture');
    await fn(dir);
  } finally { await rm(dir, { recursive: true, force: true }); }
}

test('repo-handles-paths: Unicode, tracked modifications and untracked files', async () => {
  await fixture(async dir => {
    await writeFile(join(dir, 'plik ł.txt'), 'changed\n');
    await writeFile(join(dir, 'nowy plik.txt'), 'untracked\n');
    const report = await inspectRepository({ repoDir: dir });
    assert.equal(report.git_head.length, 40);
    assert.equal(report.tracked_changes.length, 1);
    assert.equal(report.untracked_changes.length, 1);
    assert.equal(report.status, 'verified');
    assert.equal(JSON.stringify(report).includes(dir), false);
  });
});

test('repo-redacts-secrets: remote password and .env path never leave inventory', async () => {
  await fixture(async dir => {
    git(dir, 'remote', 'add', 'origin', 'https://alice:FAKE_SECRET@example.org/org/repo?token=MORE_SECRET');
    await writeFile(join(dir, '.env'), 'DO_NOT_READ=TOP_SECRET\n');
    const report = await inspectRepository({ repoDir: dir });
    const json = JSON.stringify(report);
    for (const secret of ['FAKE_SECRET', 'MORE_SECRET', 'TOP_SECRET', '.env', dir]) {
      assert.equal(json.includes(secret), false, secret + ' leaked');
    }
    assert.equal(report.remotes_redacted[0].host, 'example.org');
  });
});

test('repo-redacts-local-remotes', async () => {
  await fixture(async dir => {
    git(dir, 'remote', 'add', 'origin', 'C:/private/repository');
    const report = await inspectRepository({repoDir: dir});
    assert.equal(report.remotes_redacted[0].host, '[redacted]');
  });
});
test('repo-renames-and-multiple-worktrees', async () => {
  await fixture(async dir => {
    git(dir, 'mv', 'plik ł.txt', 'zmieniony ł.txt');
    const extra = await mkdtemp(join(tmpdir(), 'jarvis-worktree-'));
    try {
      git(dir, 'worktree', 'add', '--detach', extra);
      const report = await inspectRepository({repoDir: dir});
      assert.equal(report.tracked_changes[0].type, 'renamed-or-copied');
      assert.equal(report.tracked_changes.length, 1);
      assert.equal(report.worktrees.length, 2);
      assert.equal(JSON.stringify(report).includes(extra), false);
    } finally { git(dir, 'worktree', 'remove', '--force', extra); }
  });
});
test('repo-missing-is-unverified', async () => {
  const report = await inspectRepository({repoDir: join(tmpdir(), 'does-not-exist-jarvisaio')});
  assert.equal(report.status, 'unverified');
  assert.ok(report.errors.includes('head-unavailable'));
});
test('repo-cli-handles-Unicode-and-spaces', async () => {
  await fixture(async dir => {
    const {fileURLToPath} = await import('node:url');
    const source = fileURLToPath(new URL('../../tools/audit/repo-manifest.mjs', import.meta.url));
    const {readFile, copyFile} = await import('node:fs/promises');
    const folder = join(dir, 'narzędzia ze spacją');
    await mkdir(folder);
    const script = join(folder, 'repo-manifest.mjs');
    await copyFile(source, script);
    const out = join(dir, 'audit-private', 'report.json');
    execFileSync(process.execPath, [script, '--repo', dir, '--out', out]);
    assert.equal(JSON.parse(await readFile(out, 'utf8')).status, 'verified');
  });
});

test('repo-index-fingerprints-do-not-read-working-tree-secrets',async()=>{
 await fixture(async dir=>{
  const r=await inspectRepository({repoDir:dir});
  assert.equal(r.index_fingerprints.length,1);
  assert.match(r.index_fingerprints[0].path_sha256,/^[a-f0-9]{64}$/);
  assert.match(r.index_fingerprints[0].blob_sha,/^[a-f0-9]{40}$/);
  assert.equal(r.upstream_relation.status,'unverified');
  const noHashes=await inspectRepository({repoDir:dir,includeFileHashes:false});
  assert.equal(noHashes.index_fingerprints.length,0);
 });
});
test('repo-cli-unverified-exits-nonzero-without-private-path-error',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'jarvis-cli-'));
 try {
  const {spawnSync}=await import('node:child_process');
  const missing=join(dir,'private-unavailable');
  const result=spawnSync(process.execPath,['tools/audit/repo-manifest.mjs','--repo',missing,'--out',join(dir,'audit-private','snapshot.json')],{encoding:'utf8'});
  assert.equal(result.status,1);
  assert.equal(result.stderr.includes(missing),false);
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('repo-cli-rejects-unignored-audit-private-path',async()=>{
 await fixture(async dir=>{
  const {spawnSync}=await import('node:child_process');
  const r=spawnSync(process.execPath,['tools/audit/repo-manifest.mjs','--repo',dir,'--out',join(dir,'docs','audit-private','report.json')],{encoding:'utf8'});
  assert.equal(r.status,1);
 });
});
