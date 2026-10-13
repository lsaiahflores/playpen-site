/* The demo: an animated recreation of the Playpen window, built from HTML/CSS/JS (no video).
   One timeline of events. Autoplay runs a pausable clock. Prev/Next (always used under prefers-reduced-motion) jump to a step
   by resetting the window and replaying events up to that step instantly. The game in the test pane is an original maze-chase
   drawn procedurally on a canvas. */
(function () {
  'use strict';
  var root = document.getElementById('demo-app');
  if (!root) return;
  var $ = function (s) { return root.querySelector(s); };
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) document.documentElement.classList.add('reduced');

  var modeSeg = $('#app-mode'), tabs = root.querySelectorAll('.app-tabs .tab'), toast = $('#app-toast');
  var termLines = $('#term-lines'), chatScroll = $('#chat-scroll'), planView = $('#plan-view'), progress = $('#build-progress');
  var phoneBtn = $('#app-phone'), testTag = $('#test-tag'), canvas = $('#test-canvas'), gctx = canvas.getContext('2d');
  var capEl = document.getElementById('demo-caption'), playBtn = document.getElementById('demo-play'), replayBtn = document.getElementById('demo-replay');
  var muteBtn = document.getElementById('demo-mute'), prevBtn = document.getElementById('demo-prev'), nextBtn = document.getElementById('demo-next');

  /* ---------------------------------------------------------------- the original game: a small isometric maze, a hero and a chaser */
  var MAZE = [
    '#########',
    '#...#...#',
    '#.#.#.#.#',
    '#.#...#.#',
    '#.#####.#',
    '#...#...#',
    '#.#.#.#.#',
    '#.#...#.#',
    '#########'
  ];
  var PATH = [[1,1],[1,2],[1,3],[1,4],[1,5],[2,5],[3,5],[3,4],[3,3],[4,3],[5,3],[5,2],[5,1],[6,1],[7,1],[7,2],[7,3],[6,3],[5,3],[5,4],[5,5],[5,6],[5,7],[6,7],[7,7],[7,6],[7,5],[6,5],[5,5],[5,4],[5,3],[4,3],[3,3],[3,4],[3,5],[2,5],[1,5],[1,4],[1,3],[1,2]];
  var game = { running: false, variant: 0, t: 0, flash: 0 };

  function iso(i, j, w, ox, oy) { return { x: ox + (i - j) * w / 2, y: oy + (i + j) * w / 4 }; }
  function drawGame() {
    var cw = canvas.clientWidth, ch = canvas.clientHeight;
    if (!cw || !ch) return;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    if (canvas.width !== Math.round(cw * dpr) || canvas.height !== Math.round(ch * dpr)) { canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr); }
    gctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    gctx.clearRect(0, 0, cw, ch);
    var n = MAZE.length, w = Math.min(cw / (n + 0.5) * 1.05, ch / (n * 0.5 + 1.3) * 1.9), hgt = w * 0.34;
    var ox = cw / 2, oy = (ch - n * w / 2) / 2 + hgt * 0.4;
    // floor
    for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) {
      if (MAZE[i][j] === '#') continue;
      var p = iso(i, j, w, ox, oy);
      gctx.fillStyle = (i + j) % 2 ? '#14161d' : '#171a22';
      gctx.beginPath(); gctx.moveTo(p.x, p.y); gctx.lineTo(p.x + w / 2, p.y + w / 4); gctx.lineTo(p.x, p.y + w / 2); gctx.lineTo(p.x - w / 2, p.y + w / 4); gctx.closePath(); gctx.fill();
    }
    // actors positions along the path
    var L = PATH.length, tt = game.t * 1.5, a = Math.floor(tt) % L, f = tt - Math.floor(tt);
    function at(k) { var A = PATH[((k % L) + L) % L], B = PATH[(((k + 1) % L) + L) % L]; return [A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f]; }
    var hero = at(a), foe = at(a - 4);
    var items = [];
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) if (MAZE[y][x] === '#') items.push({ k: 'w', i: y, j: x, d: y + x });
    items.push({ k: 'h', i: hero[0], j: hero[1], d: hero[0] + hero[1] + 0.2 });
    items.push({ k: 'c', i: foe[0], j: foe[1], d: foe[0] + foe[1] + 0.2 });
    items.sort(function (p, q) { return p.d - q.d; });
    items.forEach(function (it) {
      var p = iso(it.i, it.j, w, ox, oy);
      if (it.k === 'w') {
        var x0 = p.x, y0 = p.y - hgt;
        gctx.fillStyle = '#3a3c46'; gctx.beginPath(); gctx.moveTo(x0, y0); gctx.lineTo(x0 + w / 2, y0 + w / 4); gctx.lineTo(x0, y0 + w / 2); gctx.lineTo(x0 - w / 2, y0 + w / 4); gctx.closePath(); gctx.fill();
        gctx.fillStyle = '#23252d'; gctx.beginPath(); gctx.moveTo(x0 - w / 2, y0 + w / 4); gctx.lineTo(x0, y0 + w / 2); gctx.lineTo(x0, y0 + w / 2 + hgt); gctx.lineTo(x0 - w / 2, y0 + w / 4 + hgt); gctx.closePath(); gctx.fill();
        gctx.fillStyle = '#1b1d24'; gctx.beginPath(); gctx.moveTo(x0 + w / 2, y0 + w / 4); gctx.lineTo(x0, y0 + w / 2); gctx.lineTo(x0, y0 + w / 2 + hgt); gctx.lineTo(x0 + w / 2, y0 + w / 4 + hgt); gctx.closePath(); gctx.fill();
        return;
      }
      var cx = p.x, cy = p.y + w / 4 - hgt * 0.1, s = w * 0.2;
      gctx.fillStyle = 'rgba(0,0,0,.35)'; gctx.beginPath(); gctx.ellipse(cx, cy + s * 0.6, s * 0.9, s * 0.4, 0, 0, 6.3); gctx.fill();
      if (it.k === 'c') {                                  // the chaser: a dark orb with two bright eyes
        gctx.fillStyle = '#0a0b0f'; gctx.strokeStyle = '#ff6b6b'; gctx.lineWidth = 2;
        gctx.beginPath(); gctx.arc(cx, cy - s * 0.2, s * 0.95, 0, 6.3); gctx.fill(); gctx.stroke();
        gctx.fillStyle = '#f2f2f5'; gctx.beginPath(); gctx.arc(cx - s * 0.35, cy - s * 0.35, s * 0.2, 0, 6.3); gctx.arc(cx + s * 0.35, cy - s * 0.35, s * 0.2, 0, 6.3); gctx.fill();
      } else if (game.variant === 0) {                     // the hero, first design: a round green blob
        gctx.fillStyle = '#4ecb7d'; gctx.beginPath(); gctx.arc(cx, cy - s * 0.2, s * 0.9, 0, 6.3); gctx.fill();
        gctx.fillStyle = '#08090c'; gctx.beginPath(); gctx.arc(cx - s * 0.3, cy - s * 0.35, s * 0.14, 0, 6.3); gctx.arc(cx + s * 0.3, cy - s * 0.35, s * 0.14, 0, 6.3); gctx.fill();
      } else {                                             // the redesign: a small fox
        gctx.fillStyle = '#d97757';
        gctx.beginPath(); gctx.moveTo(cx - s * 0.85, cy - s * 0.6); gctx.lineTo(cx - s * 0.5, cy - s * 1.55); gctx.lineTo(cx - s * 0.05, cy - s * 0.85); gctx.closePath(); gctx.fill();
        gctx.beginPath(); gctx.moveTo(cx + s * 0.85, cy - s * 0.6); gctx.lineTo(cx + s * 0.5, cy - s * 1.55); gctx.lineTo(cx + s * 0.05, cy - s * 0.85); gctx.closePath(); gctx.fill();
        gctx.beginPath(); gctx.arc(cx, cy - s * 0.2, s * 0.95, 0, 6.3); gctx.fill();
        gctx.fillStyle = '#f2f2f5'; gctx.beginPath(); gctx.moveTo(cx - s * 0.7, cy); gctx.lineTo(cx, cy + s * 0.75); gctx.lineTo(cx + s * 0.7, cy); gctx.lineTo(cx, cy - s * 0.3); gctx.closePath(); gctx.fill();
        gctx.fillStyle = '#08090c'; gctx.beginPath(); gctx.arc(cx - s * 0.33, cy - s * 0.45, s * 0.12, 0, 6.3); gctx.arc(cx + s * 0.33, cy - s * 0.45, s * 0.12, 0, 6.3); gctx.fill();
        gctx.beginPath(); gctx.arc(cx, cy + s * 0.15, s * 0.1, 0, 6.3); gctx.fill();
      }
    });
    if (game.flash > 0) { gctx.fillStyle = 'rgba(242,242,245,' + (game.flash * 0.35) + ')'; gctx.fillRect(0, 0, cw, ch); game.flash = Math.max(0, game.flash - 0.04); }
  }
  var raf = 0, lastT = 0;
  function gameLoop(now) {
    raf = 0;
    if (game.running && !document.hidden) { game.t += Math.min(0.05, (now - lastT) / 1000 || 0); drawGame(); }
    lastT = now;
    if (game.running || game.flash > 0) raf = requestAnimationFrame(gameLoop);
  }
  function gameOn(on) { game.running = !!on; if (on && !raf && !reduced) { lastT = performance.now(); raf = requestAnimationFrame(gameLoop); } if (!on) drawGame(); }
  function paintOnce() { drawGame(); }

  /* ---------------------------------------------------------------- DOM helpers */
  var ICON_MIC = '<svg class="ico" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
  var ICON_SPK = '<svg class="ico" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/></svg>';
  var BARS = '<span class="bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';
  var timers = [];
  function later(fn, ms, instant) { if (instant) { fn(); return; } timers.push(setTimeout(fn, ms)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function addEl(parent, cls, html) { var d = document.createElement('div'); d.className = cls; d.innerHTML = html; parent.appendChild(d); return d; }
  function show(el, instant) { if (instant) { el.classList.add('on'); return; } requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('on'); }); }); }
  function say(cls, html, instant) { var m = addEl(chatScroll, 'msg ' + cls, html); trim(chatScroll, 5); show(m, instant); return m; }
  function term(agent, html, instant) {
    var tag = agent === 'pp' ? '<span class="tag pp">Playpen</span>' : (agent === 'cc' ? '<span class="tag cc">Claude Code</span>' : '<span class="tag sys">Playpen</span>');
    var l = addEl(termLines, 'tl', tag + html); trim(termLines, 9); show(l, instant); return l;
  }
  function trim(host, max) { while (host.children.length > max) host.removeChild(host.firstChild); }
  function setMode(m) {
    root.dataset.mode = m;
    modeSeg.querySelectorAll('span').forEach(function (s) { s.classList.toggle('on', s.dataset.m === m); });
  }
  function setTab(t) { tabs.forEach(function (x) { x.classList.toggle('on', x.dataset.t === t); }); planView.classList.toggle('on', t === 'plan'); }
  function note(text, kind, ms, instant) {
    toast.textContent = text; toast.className = 'toast ' + (kind || '') + ' on';
    if (!instant) later(function () { toast.classList.remove('on'); }, ms || 2600);
  }
  function hideNote() { toast.classList.remove('on'); }
  function speak(text) {
    if (muteBtn.getAttribute('aria-pressed') === 'true' || !('speechSynthesis' in window)) return;
    try { var u = new SpeechSynthesisUtterance(text); u.rate = 1.05; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); } catch (e) { /* audio is optional */ }
  }

  function resetUI() {
    clearTimers();
    root.classList.remove('t-open', 'g-open');
    setMode('local'); setTab('chat');
    termLines.innerHTML = ''; chatScroll.innerHTML = '';
    var prog = $('#build-progress'); prog.classList.remove('on'); prog.firstElementChild.style.width = '0';
    planView.querySelectorAll('.mod, li').forEach(function (e) { e.classList.remove('on'); });
    var go = planView.querySelector('.go'); if (go) go.classList.remove('press');
    phoneBtn.classList.remove('hot'); hideNote();
    testTag.textContent = '';
    game.variant = 0; game.running = false; game.t = 0; game.flash = 0;
    drawGame();
  }

  /* ---------------------------------------------------------------- the timeline (times are ms from the start) */
  var E = [];   // { t, step, fn(instant) }
  function at(t, step, fn) { E.push({ t: t, step: step, fn: fn }); }
  var STEPS = [
    'The window opens in Local mode.',
    'Switch the mode to <b>Hybrid</b>: Playpen’s local AI and Claude will split the work.',
    'Say what you want out loud: <b>“Make me a 3D maze-chase game.”</b>',
    'The terminal opens. Playpen and Claude Code shake hands, and Playpen saves a restore point first.',
    'They build it together. Simple pieces go to the local model, harder ones to Claude Code. Each line is tagged with who wrote it.',
    'The voice assistant says <b>“Your game is ready to test.”</b>',
    'The test pane opens and the game is already playing.',
    'You ask for a new look for the main character, and the Claude usage limit is reached.',
    'No problem. Flip to <b>Local</b>, open the Plan tab, and plan the change with the local model.',
    'The change becomes a module with its own to-do list.',
    'Claude usage comes back.',
    'Send the module to the build. The change lands, and the game plays again with the new character.',
    'One click sends the game to your phone.'
  ];

  at(0, 0, function () { setMode('local'); });
  at(900, 1, function () { setMode('hybrid'); });
  at(2600, 2, function (ins) {
    var m = say('me voice', ICON_MIC + BARS + 'Make me a 3D maze-chase game.', ins);
    if (!ins) speak('Make me a 3D maze-chase game.');
  });
  at(5200, 3, function (ins) {
    root.classList.add('t-open');
    term('sys', 'Restore point saved. Nothing can be lost.', ins);
    later(function () {
      var l = term('sys', '<span class="handshake"><span class="node a">Playpen</span><span class="wire"></span><span class="node b">Claude Code</span></span>', false);
    }, 900, ins);
  });
  var BUILD = [
    ['pp', 'Planned 4 pieces: maze, hero, chaser, score.'],
    ['cc', 'Chaser logic: it plans a route to you and takes the shortest path.'],
    ['pp', 'Wiring the controls: arrow keys, WASD and a controller.'],
    ['cc', 'Adding the 3D camera and the wall collisions.'],
    ['pp', 'Painting the floor and walls. Adding footstep sounds.'],
    ['cc', 'Tuning speed so the chase feels fair.'],
    ['pp', 'Checked: it starts and plays. Done.']
  ];
  BUILD.forEach(function (b, k) {
    at(7600 + k * 1250, 4, function (ins) {
      term(b[0], b[1], ins);
      var p = $('#build-progress'); p.classList.add('on'); p.firstElementChild.style.width = Math.round((k + 1) / BUILD.length * 100) + '%';
      if (k === 0) say('pp', 'Building it now. Watch the terminal on the left.', ins);
    });
  });
  at(16800, 5, function (ins) {
    $('#build-progress').classList.remove('on');
    say('pp voice', ICON_SPK + BARS + 'Your game is ready to test.', ins);
    if (!ins) speak('Your game is ready to test.');
  });
  at(18800, 6, function (ins) {
    root.classList.add('g-open'); testTag.textContent = 'Test pane';
    gameOn(true);
  });
  at(21800, 7, function (ins) {
    say('me', 'Change the main character’s design.', ins);
    note('Claude usage limit reached', 'warn', 3200, ins);
    term('sys', 'Claude usage limit reached. Paused, nothing lost.', ins);
  });
  at(25000, 8, function (ins) { hideNote(); setMode('local'); setTab('plan'); });
  at(26600, 9, function (ins) {
    var mod = planView.querySelector('.mod'); show(mod, ins);
    var li = mod.querySelectorAll('li');
    for (var i = 0; i < li.length; i++) (function (k) { later(function () { li[k].classList.add('on'); }, 500 + k * 650, ins); })(i);
    term('pp', 'Planning the change on this computer. No Claude needed.', ins);
  });
  at(30200, 10, function (ins) { note('Claude usage is back', 'ok', 2800, ins); });
  at(32400, 11, function (ins) {
    hideNote(); setTab('chat'); setMode('hybrid');
    var go = planView.querySelector('.go'); if (go) go.classList.add('press');
    term('cc', 'Redesign the hero: swapping the blob for a fox.', ins);
    later(function () { term('pp', 'Rebuilding and testing.', false); }, 900, ins);
    later(function () { game.variant = 1; game.flash = 1; if (!raf && !reduced) { lastT = performance.now(); raf = requestAnimationFrame(gameLoop); } drawGame(); say('pp', 'Done. The hero is a fox now.', false); }, 2400, ins);
  });
  at(37200, 12, function (ins) { phoneBtn.classList.add('hot'); });
  var END = 41500;

  /* ---------------------------------------------------------------- clock */
  var clock = 0, running = false, started = false, lastTick = 0, fired = 0, step = 0, rafClock = 0;
  var stepTimes = [];
  STEPS.forEach(function (s, i) { var e = E.filter(function (x) { return x.step === i; })[0]; stepTimes.push(e ? e.t : 0); });

  function caption(i) { capEl.innerHTML = '<b>Step ' + (i + 1) + ' of ' + STEPS.length + '.</b> ' + STEPS[i]; }
  function fire(e, instant) { try { e.fn(instant); } catch (x) { /* never break the demo */ } step = e.step; caption(step); }
  function tick(now) {
    rafClock = 0;
    if (!running) return;
    clock += Math.min(100, now - lastTick); lastTick = now;
    while (fired < E.length && E[fired].t <= clock) { fire(E[fired], false); fired++; }
    if (clock >= END) { clock = END + 1; hold(); return; }
    rafClock = requestAnimationFrame(tick);
  }
  var holdTimer = 0;
  function hold() { clearTimeout(holdTimer); holdTimer = setTimeout(function () { if (running) restart(true); }, 3200); }
  function play() { if (reduced) return; running = true; started = true; lastTick = performance.now(); playBtn.textContent = 'Pause'; playBtn.setAttribute('aria-pressed', 'true'); if (!rafClock) rafClock = requestAnimationFrame(tick); if (game.variant !== undefined && root.classList.contains('g-open')) gameOn(true); }
  function pause() { running = false; playBtn.textContent = 'Play'; playBtn.setAttribute('aria-pressed', 'false'); clearTimeout(holdTimer); window.speechSynthesis && window.speechSynthesis.cancel && window.speechSynthesis.cancel(); }
  function restart(autoplay) { resetUI(); clock = 0; fired = 0; step = 0; caption(0); if (autoplay && !reduced) play(); }
  function jumpTo(i) {
    i = Math.max(0, Math.min(STEPS.length - 1, i));
    pause(); resetUI(); fired = 0; clock = 0;
    while (fired < E.length && E[fired].step <= i) { fire(E[fired], true); fired++; }
    clock = stepTimes[i]; step = i; caption(i);
    if (root.classList.contains('g-open')) paintOnce();
    prevBtn.disabled = i === 0; nextBtn.disabled = i === STEPS.length - 1;
  }

  playBtn.addEventListener('click', function () { if (reduced) { jumpTo(step + 1 >= STEPS.length ? 0 : step + 1); return; } running ? pause() : play(); });
  replayBtn.addEventListener('click', function () { reduced ? jumpTo(0) : restart(true); });
  prevBtn.addEventListener('click', function () { jumpTo(step - 1); });
  nextBtn.addEventListener('click', function () { jumpTo(step + 1); });
  muteBtn.addEventListener('click', function () {
    var on = muteBtn.getAttribute('aria-pressed') === 'true';
    muteBtn.setAttribute('aria-pressed', on ? 'false' : 'true');
    muteBtn.textContent = on ? 'Sound on' : 'Sound off';
  });
  window.addEventListener('resize', function () { drawGame(); });

  var visible = false;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      var v = es[0].isIntersecting;
      if (v && !visible) { visible = true; if (!started) restart(true); else if (!reduced && clock < END) play(); }
      if (!v && visible) { visible = false; if (running) pause(); }
    }, { threshold: 0.35 }).observe(root);
  }

  resetUI(); caption(0);
  if (reduced) { prevBtn.disabled = true; jumpTo(STEPS.length - 1); }
  else { /* start when scrolled into view */ }
  window.__demo = { steps: STEPS.length, jumpTo: jumpTo, restart: restart, state: function () { return { step: step, mode: root.dataset.mode, running: running }; } };
})();
