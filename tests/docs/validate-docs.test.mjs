import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {execFileSync} from 'node:child_process';
import {validateDocs,requiredFiles} from '../../tools/audit/validate-docs.mjs';
async function fixture(fn) {
 const root=await mkdtemp(join(tmpdir(),'jarvis-docs-'));
 try {for(const p of requiredFiles){await mkdir(dirname(join(root,p)),{recursive:true});await writeFile(join(root,p),'# Document\n');}await fn(root);}
 finally {await rm(root,{recursive:true,force:true});}
}
test('docs-valid-local-links',()=>fixture(async root=>{
 await writeFile(join(root,'README.md'),'[vision](docs/master/00-VISION.md)\n');
 assert.equal((await validateDocs({rootDir:root})).valid,true);
}));
test('docs-broken-link',()=>fixture(async root=>{
 await writeFile(join(root,'README.md'),'[missing](missing.md)\n');
 assert.equal((await validateDocs({rootDir:root})).valid,false);
}));
test('docs-required-files',()=>fixture(async root=>{
 await rm(join(root,'docs/master/06-MIGRATION-MATRIX.md'));
 assert.equal((await validateDocs({rootDir:root})).valid,false);
}));
test('docs-reject-outside-root-and-ignore-code-examples',()=>fixture(async root=>{
 await writeFile(join(root,'README.md'),'[outside](../outside.md)\n');
 assert.equal((await validateDocs({rootDir:root})).valid,false);
 await writeFile(join(root,'README.md'),'~~~md\n[example](missing.md)\n~~~\n`[example](missing.md)`\n[remote](https://example.org)\n');
 assert.equal((await validateDocs({rootDir:root})).valid,true);
}));
test('docs-reference-links-and-images',()=>fixture(async root=>{
 await writeFile(join(root,'README.md'),'[x][ref]\n[ref]: missing.md\n![image](missing.png)\n');
 const report=await validateDocs({rootDir:root});assert.equal(report.valid,false);assert.ok(report.errors.length>=2);
}));
test('docs-cli-nonzero-on-broken-fixture',()=>fixture(async root=>{
 await writeFile(join(root,'README.md'),'[bad](missing.md)\n');
 assert.throws(()=>execFileSync(process.execPath,['tools/audit/validate-docs.mjs',root]));
}));
