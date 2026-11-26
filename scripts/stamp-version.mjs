// Writes www/version.json. The build number (BUILD_NUMBER env, default = git commit count) always
// increases, so the app can tell whether the published web bundle is newer than the one it is running.
import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

let build = Number(process.env.BUILD_NUMBER);
if (!Number.isFinite(build)) {
  try { build = Number(execSync('git rev-list --count HEAD', { encoding: 'utf8' }).trim()); } catch { build = 0; }
}
const info = { version: `1.0.${build}`, build };
writeFileSync('www/version.json', JSON.stringify(info) + '\n');
console.log('Stamped www/version.json', info);
