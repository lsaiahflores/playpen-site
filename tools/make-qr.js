#!/usr/bin/env node
/* Regenerates img/qr-play.svg for a URL:  node tools/make-qr.js https://playpen.site/play/space_cat/
   Black modules on a white tile with a 2-module quiet zone. Error correction H (30% can be lost), so the Space Cat face
   (img/space-cat-face.png) sits in the middle on a white disc and the code still scans from a screen or a print.
   The module grid under the face is cleared on purpose (the face is only ever laid over the code, never over the quiet zone). */
'use strict';
const fs = require('fs');
const path = require('path');
const QR = require('qrcode');
const url = process.argv[2] || 'https://playpen.site/play/space_cat/';
const qr = QR.create(url, { errorCorrectionLevel: 'H' });
const n = qr.modules.size, q = 2, dim = n + q * 2;
const face = fs.readFileSync(path.join(__dirname, '..', 'img', 'space-cat-face.png')).toString('base64');
/* the face covers a disc of about 25% of the code's width: well inside what level H can lose */
const logoD = Math.round(n * 0.25) % 2 === n % 2 ? Math.round(n * 0.25) : Math.round(n * 0.25) + 1;
const c = dim / 2;
let rects = '';
for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
  if (!qr.modules.data[y * n + x]) continue;
  const mx = x + q + 0.5 - c, my = y + q + 0.5 - c;
  if (Math.hypot(mx, my) < logoD / 2 + 0.9) continue;       // leave the middle clear for the face and its white ring
  rects += `<rect x="${x + q}" y="${y + q}" width="1" height="1"/>`;
}
const r = logoD / 2;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="240" height="240" viewBox="0 0 ${dim} ${dim}"><title>QR code for ${url}, with the Space Cat face in the middle</title><rect width="${dim}" height="${dim}" fill="#fff"/><g fill="#000" shape-rendering="crispEdges">${rects}</g><circle cx="${c}" cy="${c}" r="${r + 0.55}" fill="#fff"/><image x="${c - r}" y="${c - r}" width="${logoD}" height="${logoD}" xlink:href="data:image/png;base64,${face}"/></svg>\n`;
fs.writeFileSync(path.join(__dirname, '..', 'img', 'qr-play.svg'), svg);
console.log('wrote img/qr-play.svg for', url, `(${n}x${n} modules, face ${logoD} modules wide)`);
