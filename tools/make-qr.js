#!/usr/bin/env node
/* Regenerates img/qr-play.svg for a URL:  node tools/make-qr.js https://playpen.site/play/maze/
   Black modules on a white tile with a 2-module quiet zone, error correction M (scans fine from a screen or a print). */
'use strict';
const fs = require('fs');
const path = require('path');
const QR = require('qrcode');
const url = process.argv[2] || 'https://playpen.site/play/maze/';
const qr = QR.create(url, { errorCorrectionLevel: 'M' });
const n = qr.modules.size, q = 2, dim = n + q * 2;
let rects = '';
for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (qr.modules.data[y * n + x]) rects += `<rect x="${x + q}" y="${y + q}" width="1" height="1"/>`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 ${dim} ${dim}" shape-rendering="crispEdges"><title>QR code for ${url}</title><rect width="${dim}" height="${dim}" fill="#fff"/><g fill="#000">${rects}</g></svg>\n`;
fs.writeFileSync(path.join(__dirname, '..', 'img', 'qr-play.svg'), svg);
console.log('wrote img/qr-play.svg for', url, `(${n}x${n} modules)`);
