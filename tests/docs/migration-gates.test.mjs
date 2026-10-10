import test from 'node:test';
import assert from 'node:assert/strict';
import {validateMatrix} from '../../tools/audit/validate-matrix.mjs';
const row={module_id:'core',capability:'tasks',old_paths:['js/core.js'],old_commit:'9713065f4489a168f3b0cf041ee8fd9c9f84eb94',dependencies:[],owner_of_state:'core',target_boundary:'core',strategy:'replace',migration_status:'planned',baseline_test:'unverified',target_test:'planned',rollback:'retain old system',evidence_link:'https://github.com/majkel2403/Jarvis-/blob/9713065f4489a168f3b0cf041ee8fd9c9f84eb94/js/core.js',decision_adr:'D-002'};
test('matrix-valid-row',()=>assert.equal(validateMatrix([row]).valid,true));
test('matrix-invalid-row: missing rollback',()=>{const r={...row};delete r.rollback;assert.equal(validateMatrix([r]).valid,false);});
test('matrix-invalid-row: duplicate id',()=>assert.equal(validateMatrix([row,row]).valid,false));
test('matrix-invalid-row: invalid strategy or status',()=>{
 for(const change of [{strategy:'copy-all'},{migration_status:'works'},{old_commit:'main'},{dependencies:['missing']},{old_paths:['../secret']},{rollback:''}])assert.equal(validateMatrix([{...row,...change}]).valid,false);
});
test('matrix-invalid-row: malformed collection',()=>{for(const x of [null,{},[],[null]])assert.equal(validateMatrix(x).valid,false);});
