import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { StatusBar, Style } from '@capacitor/status-bar';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { checkForUpdate } from './native-updater.js';

// Injected at build time by scripts/build-native.mjs (empty string = updates disabled).
const UPDATE_BASE_URL = typeof __UPDATE_BASE_URL__ !== 'undefined' ? __UPDATE_BASE_URL__ : '';

if (Capacitor.isNativePlatform()) {
  // 1) Tell the updater this web bundle started fine. Must run immediately, before anything async,
  //    otherwise a freshly installed bundle is treated as broken and rolled back.
  CapacitorUpdater.notifyAppReady();

  // 2) Saving files. A blob <a download> link does nothing inside the Android WebView, so the app hands the
  //    file to Android's share sheet instead (Save to Files / Drive, WhatsApp, e-mail, ...).
  //    www/js/21-data-safety.js calls this when it exists.
  window.__htNativeSaveFile = async (name, text) => {
    const { uri } = await Filesystem.writeFile({ path: name, data: text, directory: Directory.Cache, encoding: Encoding.UTF8 });
    await Share.share({ title: name, dialogTitle: 'Save or send your backup', files: [uri] });
  };

  // 3) Status bar follows the app theme (cream + dark icons in light, navy + light icons in dark).
  //    On Android 15+ the page draws behind the bar, so only the icon style matters there.
  const syncStatusBar = () => {
    try {
      const root = document.documentElement;
      const dark = root.getAttribute('data-theme') === 'dark';
      const bg = getComputedStyle(root).getPropertyValue('--bg').trim();
      if (/^#[0-9a-f]{6}$/i.test(bg)) StatusBar.setBackgroundColor({ color: bg }).catch(() => {});
      StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light }).catch(() => {});
    } catch (e) { /* cosmetic only */ }
  };
  syncStatusBar();
  new MutationObserver(syncStatusBar).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // 4) Android Back: close the topmost open layer (Settings, sheets, dialogs) first.
  //    Only when nothing is open (root screen) does Back leave the app.
  App.addListener('backButton', () => {
    try {
      if (window.__htCloseTopLayer && window.__htCloseTopLayer()) return;
    } catch (e) { /* fall through to the safety net below */ }

    // Safety net: never exit while Settings is still showing.
    const settings = document.getElementById('settingsPanel');
    if (settings && settings.classList.contains('open')) {
      const close = document.getElementById('settingsClose');
      if (close) close.click();
      return;
    }
    App.exitApp();
  });

  // 5) Quietly check for a newer web bundle: shortly after launch, and when the app returns to the
  //    foreground (at most every 30 minutes).
  const readLocalBuild = async () => {
    try {
      const r = await fetch('version.json', { cache: 'no-store' });
      return Number((await r.json()).build) || 0;
    } catch (e) { return 0; }
  };
  let lastCheck = 0;
  const run = () => {
    lastCheck = Date.now();
    checkForUpdate({
      baseUrl: UPDATE_BASE_URL,
      updater: CapacitorUpdater,
      fetchFn: (...a) => fetch(...a),
      readLocalBuild,
      onDownloaded: () => {
        if (window.showToast) window.showToast('Update downloaded. It will apply next time you open the app.', 'info');
      }
    }).catch(err => console.warn('[OTA] update check failed:', err));
  };
  setTimeout(run, 3000);
  App.addListener('appStateChange', ({ isActive }) => {
    if (isActive && Date.now() - lastCheck > 30 * 60 * 1000) run();
  });
}
