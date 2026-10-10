import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('decision-ledger-sources: gateway conflict keeps both sources and open status', async () => {
 const s = await readFile('docs/master/DECISION-LEDGER.md','utf8');
 assert.match(s,/8642/); assert.match(s,/8643/);
 assert.match(s,/2026-10-07-hermes-runtime-unification-design/);
 assert.match(s,/bridge\/restart-gateway.ps1/); assert.match(s,/open/);
});
test('current-state-has-sha: remote baseline distinct from inaccessible local state', async () => {
 const s = await readFile('docs/master/01-CURRENT-STATE.md','utf8');
 assert.match(s,/9713065f4489a168f3b0cf041ee8fd9c9f84eb94/);
 for(const field of ['captured_at','source_repo','head_sha','verification_status','evidence_ref','unverified']) assert.ok(s.includes(field));
});
