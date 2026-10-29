# Where the game lives

The QR code on the home page points to `https://playpen.site/play/space_cat/`. That page is a thin full-screen frame onto the game,
which is hosted at `https://play.playpen.site/index.html` (a Godot web export in a Cloudflare R2 bucket).

Updating the game never touches this site: export the game and upload it to the bucket, and the QR code, the "Play it here
instead" link and the page all show the new version straight away. Only change this page if the game's address changes.

If you want a different QR URL, change it in `tools/build.js` and regenerate `img/qr-play.svg`:
`node tools/make-qr.js https://playpen.site/play/<name>/`
The code has the Space Cat face (`img/space-cat-face.png`) in the middle, so it is generated with error correction H.
`play/maze/` is kept only as a forwarding page for the old address.

Keep it phone-friendly: touch controls, and no sign-in.
