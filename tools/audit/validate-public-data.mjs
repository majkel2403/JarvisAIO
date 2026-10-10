import {execFileSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
export function scanText(path,text) {
 const errors=[];
 const rules=[
  ['credential-pattern',/(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|sk-(?:or-v1-|proj-)?[A-Za-z0-9_-]{24,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)/],
  ['private-user-path',/(?:[A-Za-z]:[\\/]Users[\\/][A-Za-z0-9_.-]+|\/home\/[A-Za-z0-9_.-]+|\/Users\/[A-Za-z0-9_.-]+)/]
 ];
 for(const [kind,pattern] of rules)if(pattern.test(text))errors.push({path,kind});
 return errors;
}
async function cli() {
 const paths=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean),errors=[];
 for(const path of paths) {
  if(path.startsWith('artifacts/audit-private/')||/(^|\/)\.env(?:\.|$)/.test(path))errors.push({path:'[private-path]',kind:'private-file-tracked'});
  if(!/\.(?:md|mjs|js|json|yml|yaml|ps1|txt)$/.test(path)&&path!=='.gitignore')continue;
  errors.push(...scanText(path,await readFile(path,'utf8')));
 }
 for(const error of errors)console.error(JSON.stringify(error));
 console.log(errors.length?'Public data check failed':'Public data heuristic check passed');
 if(errors.length)process.exitCode=1;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))cli().catch(()=>{console.error('public data scan unavailable');process.exitCode=1;});
