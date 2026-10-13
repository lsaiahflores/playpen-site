# Where the real demo game goes

The QR code on the home page points to `https://playpen.site/play/maze/`.

Today `play/maze/index.html` is a **placeholder** (a tiny dot-in-a-maze with touch controls) so the route, the QR and phone
controls can be checked.

To use a real Playpen-built game:

1. Export it as an HTML5/web build (Playpen's Test pane already makes one: a folder with `index.html`).
2. Delete the contents of `play/maze/` and copy the export's files into it, so that `play/maze/index.html` is the game.
3. The page's Content-Security-Policy is only on the placeholder. A Godot web export needs its own settings; it does not need
   any of the site's CSS or JS.
4. Remove the "A real Playpen-made game will live here" note in `tools/build.js` (class `placeholder-note`) and rebuild with
   `node tools/build.js`.
5. If you want a different URL, change it in `tools/build.js` and regenerate `img/qr-play.svg`:
   `node tools/make-qr.js https://playpen.site/play/<name>/`

Keep it phone-friendly: touch controls, and no sign-in.
