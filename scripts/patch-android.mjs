// Run after `npx cap add android`. Small native tweaks the Capacitor template doesn't offer:
//   * Android 12+ splash screen uses the app's cream (light) / navy (dark) background instead of white.
// Failing to patch only logs a warning (the app still builds, just with the default splash colour).
import fs from 'node:fs';

const res = 'android/app/src/main/res';
const colors = (hex) => `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ht_splash_bg">${hex}</color>\n</resources>\n`;

fs.mkdirSync(`${res}/values-night`, { recursive: true });
fs.writeFileSync(`${res}/values/ht_colors.xml`, colors('#fefbe8'));
fs.writeFileSync(`${res}/values-night/ht_colors.xml`, colors('#121b2d'));

const stylesPath = `${res}/values/styles.xml`;
let xml = fs.readFileSync(stylesPath, 'utf8');
if (xml.includes('windowSplashScreenBackground')) {
  console.log('styles.xml already patched');
} else {
  const re = /(<style\s+name="AppTheme\.NoActionBarLaunch"[^>]*>)/;
  if (!re.test(xml)) {
    console.warn('WARNING: AppTheme.NoActionBarLaunch not found in styles.xml; Android 12+ splash colour left at default');
  } else {
    xml = xml.replace(re, '$1\n        <item name="windowSplashScreenBackground">@color/ht_splash_bg</item>');
    fs.writeFileSync(stylesPath, xml);
    console.log('Patched styles.xml: Android 12+ splash background');
  }
}
