import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const fields=['module_id','capability','old_paths','old_commit','dependencies','owner_of_state','target_boundary','strategy','migration_status','baseline_test','target_test','rollback','evidence_link','decision_adr'];
const strategies=new Set(['reuse','adapter','refactor','replace','defer']);
const statuses=new Set(['planned','unverified','blocked','verified','migrated']);
export function validateMatrix(rows) {
 const errors=[];
 if(!Array.isArray(rows)||rows.length===0)return {valid:false,errors:['matrix must be a nonempty array']};
 const ids=new Set();
 for(const [i,row] of rows.entries()) {
  if(!row||typeof row!=='object'||Array.isArray(row)){errors.push('row '+i+' must be an object');continue;}
  for(const field of fields) {
   const v=row[field];
   if(field==='old_paths'||field==='dependencies'){
    if(!Array.isArray(v)||v.some(x=>typeof x!=='string'||!x.trim())||(field==='old_paths'&&v.length===0))errors.push('row '+i+' invalid '+field);
   }else if(typeof v!=='string'||!v.trim())errors.push('row '+i+' missing '+field);
  }
  if(ids.has(row.module_id))errors.push('duplicate module_id: '+row.module_id);
  ids.add(row.module_id);
  if(!/^[a-z][a-z0-9-]*$/.test(row.module_id||''))errors.push('invalid module_id');
  if(!strategies.has(row.strategy))errors.push('invalid strategy');
  if(!statuses.has(row.migration_status))errors.push('invalid migration_status');
  if(!/^[a-f0-9]{40}$/.test(row.old_commit||''))errors.push('old_commit must be full SHA');
  if(Array.isArray(row.old_paths)&&row.old_paths.some(p=>typeof p!=='string'||p.startsWith('/')||p.includes('..')||p.includes('\\')||/^[A-Za-z]:/.test(p)))errors.push('unsafe old path');
  if(typeof row.evidence_link!=='string'||!row.evidence_link.startsWith('https://github.com/'))errors.push('invalid evidence_link');
  if(['verified','migrated'].includes(row.migration_status)&&(!row.baseline_test?.includes('exit 0')||!row.target_test?.includes('exit 0')))errors.push('verified migration needs baseline and target exit 0 evidence');
 }
 for(const row of rows)if(row&&Array.isArray(row.dependencies))for(const id of row.dependencies)if(!ids.has(id)||id===row.module_id)errors.push('invalid dependency: '+id);
 return {valid:errors.length===0,errors};
}
async function cli() {
 let rows;
 try {rows=JSON.parse(await readFile(process.argv[2]||'docs/master/migration-matrix.json','utf8'));}
 catch {console.error('matrix unreadable or invalid JSON');process.exitCode=1;return;}
 const result=validateMatrix(rows);
 // This repo's pinned inventory proves paths, not behavior.
 const inventory=JSON.parse(await readFile('docs/master/source-inventory.json','utf8'));
 const known=new Set(inventory.files.map(x=>x.path));
 if(result.valid)for(const row of rows) {
  if(row.old_commit!==inventory.head_sha)result.errors.push('SHA differs from source inventory');
  for(const p of row.old_paths)if(!known.has(p))result.errors.push('source path missing: '+p);
 }
 result.valid=result.errors.length===0;
 for(const error of result.errors)console.error(error);
 console.log(result.valid?'Migration matrix valid':'Migration matrix invalid');
 if(!result.valid)process.exitCode=1;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))cli().catch(()=>{console.error('matrix validation failed');process.exitCode=1;});
