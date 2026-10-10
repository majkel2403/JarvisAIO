import {readFile,readdir,realpath,stat} from 'node:fs/promises';
import {resolve,relative,dirname,isAbsolute,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
export const requiredFiles=['README.md','AGENTS.md',...['00-VISION','01-CURRENT-STATE','02-TARGET-ARCHITECTURE','03-MODULE-OWNERSHIP','04-API-AND-EVENT-CONTRACTS','05-AUTONOMY-AND-AGENTS','06-MIGRATION-MATRIX','07-MIGRATION-ROADMAP','08-TEST-AND-ACCEPTANCE','09-PROJECT-STATUS','DECISION-LEDGER','EVIDENCE-INDEX'].map(x=>'docs/master/'+x+'.md')];
const outside=(root,path)=>{const r=relative(root,path);return r==='..'||r.startsWith('..'+sep)||isAbsolute(r);};
async function markdownFiles(root,base=root) {
 const files=[];
 for(const e of await readdir(base,{withFileTypes:true})) {
  if(['.git','node_modules','artifacts'].includes(e.name))continue;
  const p=resolve(base,e.name);
  if(e.isDirectory())files.push(...await markdownFiles(root,p));
  else if(e.isFile()&&e.name.endsWith('.md'))files.push(p);
 }
 return files;
}
export async function validateDocs({rootDir=process.cwd()}={}) {
 const errors=[];
 let root;
 try {root=await realpath(resolve(rootDir));}catch{return {valid:false,errors:['root unavailable']};}
 for(const p of requiredFiles)try {if(!(await stat(resolve(root,p))).isFile())throw Error();}catch{errors.push('required file missing: '+p);}
 let files;
 try {files=await markdownFiles(root);}catch{return {valid:false,errors:[...errors,'documentation unreadable']};}
 for(const file of files) {
  let text=await readFile(file,'utf8');
  text=text.replace(/^```[^\n]*\n[\s\S]*?^```[^\n]*$/gm,'').replace(/^~~~[^\n]*\n[\s\S]*?^~~~[^\n]*$/gm,'').replace(/`[^`\n]*`/g,'');
  const targets=[];
  for(const m of text.matchAll(/!?\[[^\]\n]*\]\(\s*(<[^>]+>|[^\s)]+)(?:\s+["'][^\n]*?["'])?\s*\)/g))targets.push(m[1].replace(/^<|>$/g,''));
  const definitions=new Map();
  for(const m of text.matchAll(/^\s*\[([^\]]+)\]:\s*(\S+)/gm)){definitions.set(m[1].toLowerCase(),m[2]);targets.push(m[2]);}
  for(const m of text.matchAll(/!?\[([^\]\n]+)\]\[([^\]\n]*)\]/g))if(!definitions.has((m[2]||m[1]).toLowerCase()))errors.push('undefined reference in '+relative(root,file));
  for(const href of targets) {
   if(/^(?:https?:|mailto:|tel:)/i.test(href)||href.startsWith('#'))continue;
   if(/^[a-z][a-z0-9+.-]*:/i.test(href)){errors.push('unsupported local URL in '+relative(root,file));continue;}
   let target;
   try {target=decodeURIComponent(href.split(/[?#]/)[0]);}catch{errors.push('invalid URL encoding in '+relative(root,file));continue;}
   if(!target)continue;
   const dest=resolve(dirname(file),target);
   if(outside(root,dest)){errors.push('link escapes root in '+relative(root,file));continue;}
   try {const actual=await realpath(dest);if(outside(root,actual))errors.push('symlink escapes root in '+relative(root,file));}
   catch{errors.push('broken local link: '+relative(root,file)+' -> '+target);}
  }
 }
 return {valid:errors.length===0,errors};
}
async function cli() {
 const r=await validateDocs({rootDir:process.argv[2]||process.cwd()});
 for(const error of r.errors)console.error(error);
 console.log(r.valid?'Documentation valid':'Documentation invalid');if(!r.valid)process.exitCode=1;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))cli().catch(()=>{console.error('documentation validation failed');process.exitCode=1;});
