import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('core-owns-task-state', async () => {
 const ownership=await readFile('docs/master/03-MODULE-OWNERSHIP.md','utf8');
 for(const token of ['core','hermes','jev','bridge','registry','event-bus','memory','agents','workflow','desktop','mobile','orb','durable task state','optional']) assert.ok(ownership.includes(token),token);
});
test('mvp-three-scenarios',async()=>{
 const vision=await readFile('docs/master/00-VISION.md','utf8');
 for(const token of ['dashboard','Telegram','restart','bez otwartej karty']) assert.ok(vision.includes(token),token);
});
