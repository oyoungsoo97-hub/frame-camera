import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
await build({absWorkingDir:fileURLToPath(new URL('..',import.meta.url)),entryPoints:['scripts/native-entry.js'],outfile:'dist/native-bridge.js',bundle:true,format:'esm',minify:true,target:['safari15','chrome100']});
