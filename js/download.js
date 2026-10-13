/* Download page: asks GitHub's public releases API (from the visitor's browser) for the latest installer, and shows its version,
   size and SHA-256. If anything fails the plain link still works. This is the ONLY third-party request the site ever makes besides
   the beta form's post, and it happens only on /download/. */
(function () {
  'use strict';
  var host = document.getElementById('dl-live');
  if (!host) return;
  var REPO = host.getAttribute('data-repo');
  var btn = document.getElementById('dl-button'), ver = document.getElementById('dl-version'), size = document.getElementById('dl-size'),
      sha = document.getElementById('dl-sha'), file = document.getElementById('dl-file'), status = document.getElementById('dl-status');
  function mb(n) { return (n / 1048576).toFixed(0) + ' MB'; }
  fetch('https://api.github.com/repos/' + REPO + '/releases/latest', { headers: { Accept: 'application/vnd.github+json' }, credentials: 'omit', referrerPolicy: 'no-referrer' })
    .then(function (r) { if (!r.ok) throw new Error('status ' + r.status); return r.json(); })
    .then(function (rel) {
      var a = (rel.assets || []).filter(function (x) { return /\.exe$/i.test(x.name); })[0];
      if (!a) throw new Error('no installer asset');
      btn.href = a.browser_download_url;
      ver.textContent = String(rel.tag_name || rel.name || '').replace(/^v/, '');
      size.textContent = mb(a.size);
      file.textContent = a.name;
      var m = /sha-?256[^0-9a-f]*([0-9a-f]{64})/i.exec(rel.body || '');
      var d = a.digest && /sha256:([0-9a-f]{64})/i.exec(a.digest);
      sha.textContent = (m && m[1]) || (d && d[1]) || 'See the release page';
      status.textContent = '';
    })
    .catch(function () {
      status.textContent = 'Couldn’t read the latest release just now. The button still goes to the releases page.';
    });
})();
