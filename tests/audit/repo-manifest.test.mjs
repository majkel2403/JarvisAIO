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
