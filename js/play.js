/* PLACEHOLDER game for /play/maze/. Replace this whole folder with a real Playpen-built HTML5 export (see play/README.md).
   It only proves the route, the QR and touch controls work: move the dot with the arrow buttons, WASD or a swipe. */
(function () {
  'use strict';
  var c = document.getElementById('game'), x = c.getContext('2d'), N = 9, p = { i: 1, j: 1 };
  var M = ['#########', '#...#...#', '#.#.#.#.#', '#.#...#.#', '#.#####.#', '#...#...#', '#.#.#.#.#', '#.#...#.#', '#########'];
  function draw() {
    var s = c.width / N;
    x.fillStyle = '#0a0b0f'; x.fillRect(0, 0, c.width, c.height);
    for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) { x.fillStyle = M[i][j] === '#' ? '#3a3c46' : '#15171e'; x.fillRect(j * s + 1, i * s + 1, s - 2, s - 2); }
    x.fillStyle = '#4ecb7d'; x.beginPath(); x.arc((p.j + 0.5) * s, (p.i + 0.5) * s, s * 0.32, 0, 7); x.fill();
  }
  function move(di, dj) { var ni = p.i + di, nj = p.j + dj; if (M[ni] && M[ni][nj] === '.') { p.i = ni; p.j = nj; draw(); } }
  document.querySelectorAll('[data-d]').forEach(function (b) {
    b.addEventListener('pointerdown', function (e) { e.preventDefault(); var d = b.dataset.d.split(',').map(Number); move(d[0], d[1]); });
  });
  addEventListener('keydown', function (e) {
    var k = { ArrowUp: [-1, 0], w: [-1, 0], ArrowDown: [1, 0], s: [1, 0], ArrowLeft: [0, -1], a: [0, -1], ArrowRight: [0, 1], d: [0, 1] }[e.key];
    if (k) { e.preventDefault(); move(k[0], k[1]); }
  });
  var sx = 0, sy = 0;
  c.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  c.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return;
    if (Math.abs(dx) > Math.abs(dy)) move(0, dx > 0 ? 1 : -1); else move(dy > 0 ? 1 : -1, 0);
  }, { passive: true });
  c.width = c.height = 450;
  draw();
})();
