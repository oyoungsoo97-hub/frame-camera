import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
await build({absWorkingDir:fileURLToPath(new URL('..',import.meta.url)),entryPoints:['scripts/native-entry.js'],outfile:'dist/native-bridge.js',bundle:true,format:'esm',minify:true,target:['safari15','chrome90']});

import {mkdir,copyFile,readdir} from 'node:fs/promises';
const root=new URL('..',import.meta.url);
await mkdir(new URL('dist/licenses/',root),{recursive:true});
for(const name of await readdir(new URL('licenses/',root)))await copyFile(new URL('licenses/'+name,root),new URL('dist/licenses/'+name,root));
