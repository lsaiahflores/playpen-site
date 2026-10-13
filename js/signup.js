/* Beta signup: one fetch POST to Supabase's REST endpoint. No SDK, no third-party script. Sends: email, wants_updates, source. */
(function () {
  'use strict';
  var form = document.getElementById('beta-form');
  if (!form) return;
  var cfg = window.PLAYPEN_CONFIG || {};
  var email = document.getElementById('beta-email');
  var upd = document.getElementById('beta-updates');
  var status = document.getElementById('beta-status');
  var btn = document.getElementById('beta-submit');
  var connected = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function say(kind, text) { status.className = 'form-status ' + kind; status.textContent = text; }
  if (!connected) say('info', 'The beta list isn’t connected yet, so nothing is sent from here. Email hello@playpen.site to be added.');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = (email.value || '').trim();
    if (!EMAIL.test(v) || v.length > 254) { say('err', 'That email doesn’t look right. Check it and try again.'); email.focus(); return; }
    if (!connected) { say('info', 'The beta list isn’t connected yet, so nothing was sent. Email hello@playpen.site and we’ll add you.'); return; }
    btn.disabled = true; say('info', 'Sending…');
    var url = cfg.SUPABASE_URL.replace(/\/+$/, '') + '/rest/v1/beta_signups';
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: cfg.SUPABASE_ANON_KEY, Authorization: 'Bearer ' + cfg.SUPABASE_ANON_KEY, Prefer: 'return=minimal' },
      body: JSON.stringify({ email: v, wants_updates: !!upd.checked, source: 'website' }),
      referrerPolicy: 'no-referrer', credentials: 'omit'
    }).then(function (r) {
      if (r.status === 201 || r.status === 200 || r.status === 204) { say('ok', 'You’re on the list. Thank you.'); form.reset(); return; }
      if (r.status === 409) { say('ok', 'You’re already on the list. Nothing more to do.'); return; }
      if (r.status === 429) { say('err', 'Too many tries right now. Please wait a minute and try again.'); return; }
      say('err', 'Something went wrong on our side. Please try again, or email hello@playpen.site.');
    }).catch(function () {
      say('err', 'Couldn’t reach the sign-up service. Check your connection and try again.');
    }).then(function () { btn.disabled = false; });
  });
})();
