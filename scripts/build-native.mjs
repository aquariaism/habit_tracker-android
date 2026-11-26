// Bundles src/native.js into www/js/native.bundle.js.
// UPDATE_BASE_URL (env) is baked in; leave it unset to build an app without OTA updates.
import { build } from 'esbuild';

const base = (process.env.UPDATE_BASE_URL || '').replace(/\/+$/, '');
await build({
  entryPoints: ['src/native.js'],
  bundle: true,
  platform: 'browser',
  target: 'es2020',
  outfile: 'www/js/native.bundle.js',
  define: { __UPDATE_BASE_URL__: JSON.stringify(base) },
  logLevel: 'info'
});
console.log(base ? `OTA updates enabled -> ${base}` : 'OTA updates disabled (UPDATE_BASE_URL not set)');
