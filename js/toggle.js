/* The Local / Hybrid / Claude switch. A real radiogroup: arrow keys move, Space/Enter select, Hybrid is the default. */
(function () {
  'use strict';
  var group = document.getElementById('mode-toggle');
  var panel = document.getElementById('mode-panel');
  if (!group || !panel) return;
  var thumb = group.querySelector('.thumb');
  var btns = Array.prototype.slice.call(group.querySelectorAll('button[role="radio"]'));
  var tpl = {};
  Array.prototype.forEach.call(document.querySelectorAll('template[data-mode]'), function (t) { tpl[t.dataset.mode] = t; });
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function current() { return btns.filter(function (b) { return b.getAttribute('aria-checked') === 'true'; })[0]; }
  function place(btn) {
    thumb.style.width = btn.offsetWidth + 'px';
    thumb.style.transform = 'translateX(' + (btn.offsetLeft - 4) + 'px)';
  }
  function select(mode, focus) {
    var cur = current();
    var same = cur && cur.dataset.mode === mode && panel.firstElementChild;
    btns.forEach(function (b) {
      var on = b.dataset.mode === mode;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
      if (on) { place(b); if (focus) b.focus(); }
    });
    if (same) return;
    var swap = function () {
      panel.innerHTML = '';
      panel.appendChild(tpl[mode].content.cloneNode(true));
      panel.classList.remove('swap');
    };
    if (reduce || !panel.firstElementChild) swap(); else { panel.classList.add('swap'); setTimeout(swap, 200); }
  }
  btns.forEach(function (b, i) {
    b.addEventListener('click', function () { select(b.dataset.mode, false); });
    b.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : (e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0);
      if (!d) return;
      e.preventDefault();
      select(btns[(i + d + btns.length) % btns.length].dataset.mode, true);
    });
  });
  function replace() { var on = current(); if (on) place(on); }
  window.addEventListener('resize', replace);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(replace);
  select('hybrid', false);
})();
