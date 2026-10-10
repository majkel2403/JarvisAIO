import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('contract-status: every registry row has source and allowed status',async()=>{
 const s=await readFile('docs/master/04-API-AND-EVENT-CONTRACTS.md','utf8');
 const rows=s.split('\n').filter(x=>x.startsWith('| C-'));
 assert.ok(rows.length>=6);
 for(const row of rows) {assert.match(row,/existing-verified|planned|unverified/);assert.match(row,/https:\/\/|\.md/);}
 for(const field of ['contract_id','current_source','target_consumer','owner','decision_status','test_reference','task_id','event_id','idempotency']) assert.ok(s.includes(field),field);
});
test('jev-is-optional: autonomy preserves fallback and evidence gate',async()=>{
 const s=await readFile('docs/master/05-AUTONOMY-AND-AGENTS.md','utf8');
 for(const token of ['optional','fallback','Hermes','lease','checkpoint','verifying','completed','reconciliation']) assert.ok(s.includes(token),token);
});
