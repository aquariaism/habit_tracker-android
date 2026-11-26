// Over-the-air (OTA) updates for the Android app.
//
// The APK ships with a built-in copy of the web app (www/) so it works offline. Every push to `main`
// also publishes a fresh copy to GitHub Pages (see .github/workflows/publish-update.yml). On launch the
// app compares its own build number with the published one; if a newer one exists it downloads it in
// the background and Android switches to it the next time the app is closed or sent to the background.
// If a new bundle ever fails to start, the plugin automatically rolls back to the last working one.

/**
 * @param {object}   o
 * @param {string}   o.baseUrl         where version.json + bundle zips are published (no trailing slash)
 * @param {object}   o.updater         the CapacitorUpdater plugin (download / next / list)
 * @param {Function} o.fetchFn         fetch implementation
 * @param {Function} o.readLocalBuild  () => Promise<number>  build number of the running web app
 * @param {Function} [o.onDownloaded]  called with the new version string once an update is queued
 * @returns {Promise<'disabled'|'up-to-date'|'already-queued'|'downloaded'>}
 */
export async function checkForUpdate({ baseUrl, updater, fetchFn, readLocalBuild, onDownloaded }) {
  if (!baseUrl) return 'disabled';

  const local = await readLocalBuild();
  const res = await fetchFn(`${baseUrl}/version.json?t=${Date.now()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`version.json HTTP ${res.status}`);
  const remote = await res.json();

  const build = Number(remote && remote.build);
  if (!Number.isFinite(build) || typeof remote.version !== 'string' || typeof remote.url !== 'string') {
    throw new Error('version.json is malformed');
  }
  if (!remote.url.startsWith('https://')) throw new Error('bundle url must be https');
  if (build <= local) return 'up-to-date';

  // Don't download the same bundle again if it is already waiting to be applied.
  const { bundles = [] } = await updater.list();
  const existing = bundles.find(b => b.version === remote.version && b.status !== 'error');
  if (existing) return 'already-queued';

  const bundle = await updater.download({ url: remote.url, version: remote.version });
  await updater.next({ id: bundle.id });   // applied when the app next goes to background / restarts
  if (onDownloaded) onDownloaded(remote.version);
  return 'downloaded';
}
