import test from 'node:test';
import assert from 'node:assert/strict';
import {scanText} from '../../tools/audit/validate-public-data.mjs';
test('public-data detects credential and private path without disclosing match',()=>{
 const value='ghp_'+'A'.repeat(36);
 const errors=scanText('config.txt',value+'\nC:'+String.fromCharCode(92)+'Users'+String.fromCharCode(92)+'someone');
 assert.equal(errors.length,2);
 assert.equal(JSON.stringify(errors).includes(value),false);
 assert.equal(JSON.stringify(errors).includes('someone'),false);
});
test('public-data permits synthetic fixtures and hashes',()=>{
 assert.deepEqual(scanText('example.md','FAKE_SECRET\n9713065f4489a168f3b0cf041ee8fd9c9f84eb94'),[]);
});
