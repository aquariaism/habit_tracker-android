// Shows the running build number next to the version in Settings (so you can see an update arrived).
(async function () {
  try {
    const r = await fetch('version.json', { cache: 'no-store' });
    const { build } = await r.json();
    const el = document.querySelector('.settings-version');
    if (el && build > 0) el.textContent += ' · build ' + build;
  } catch (e) { /* offline / not stamped: keep the plain label */ }
})();
