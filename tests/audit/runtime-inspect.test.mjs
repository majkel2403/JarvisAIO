import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtemp, readFile, rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
test('runtime-unknown: fixture never proves a live service and strips private fields', async () => {
 const dir = await mkdtemp(join(tmpdir(), 'jarvis-runtime-'));
 try {
  const out = join(dir, 'audit-private', 'runtime.json');
  execFileSync('pwsh', ['-NoProfile','-File','tools/audit/runtime-inspect.ps1','-FixturePath','tests/fixtures/runtime-minimal.json','-OutputPath',out]);
  const json = await readFile(out,'utf8'), report = JSON.parse(json);
  assert.equal(report.ports[0].status,'unverified');
  assert.equal(report.gateway_status,'unverified');
  assert.equal(report.source,'fixture');
  assert.equal(json.includes('CommandLine'),false);
  assert.equal(json.includes('FAKE_SECRET'),false);
 } finally {await rm(dir,{recursive:true,force:true});}
});

test('runtime-cli-rejects-unignored-audit-private-path',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'jarvis-runtime-invalid-'));
 try {
  const {spawnSync}=await import('node:child_process');
  const r=spawnSync('pwsh',['-NoProfile','-File','tools/audit/runtime-inspect.ps1','-FixturePath','tests/fixtures/runtime-minimal.json','-OutputPath',join(dir,'docs','audit-private','report.json')],{encoding:'utf8'});
  assert.notEqual(r.status,0);
 }finally{await rm(dir,{recursive:true,force:true});}
});
