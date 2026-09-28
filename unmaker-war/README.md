# The Unmaker War

A 2D animated film of *The Unmaker War* from The Boundless Nexus. Every frame is drawn live on a canvas, and the sound is synthesized with WebAudio. It runs about 16½ minutes across a prologue, twelve chapters and an epilogue.

## Watch it

Open `dist/the-unmaker-war.html` in any modern browser. It's a single self-contained file. Click **Play the film**. Fonts load from Google Fonts when you're online and fall back to system fonts when you're not.

Keys: `Space` play or pause, `←` `→` jump 5 seconds, `[` `]` previous or next chapter, `C` captions, `M` sound, `F` fullscreen. Add `#ch7` (for example) to the URL to open at a chapter.

## How it's built

| Path | What it holds |
| --- | --- |
| `src/00-core.js` | Math, easing, keyframes, noise, color |
| `src/01-render.js` | Canvas sizing, camera, post effects |
| `src/02-audio.js` | Procedural score and sound effects |
| `src/05-fx.js` | Glows, beams, slashes, lightning, particles, erasure effects |
| `src/10-rig.js` | Side-view skeletal rig, poses, cel-shaded limbs, cloth, faces |
| `src/11-hair-gear.js` | Hair styles and weapons (Malevolor's scythe, daggers, glaive, lantern, …) |
| `src/12-cast.js`, `src/13-cast2.js` | Character designs locked to the design reference |
| `src/14-giants.js` | The Unmaker, the Unmade, Guardians, Titans, Wardens, Judges, Ferrymen, Valorion |
| `src/15-portraits.js` | Front-facing close-ups with expressions |
| `src/21-backgrounds.js` | Realms: Aegis, citadel, battlefields, the Tapestry, the wound, the stable reality |
| `src/30-timeline.js`, `src/31-kit.js` | Shots, captions, title cards, damage continuity |
| `src/40-44-story-*.js` | The film itself, shot by shot |
| `src/50-player.js` | Playback, scrubbing, chapters, adaptive quality |

Injuries only accumulate. `UW.DMG` in `src/31-kit.js` holds each character's damage by chapter, so Chase's lost eye and left arm, Seraphina's burned wings and Malevolor's breaking armor persist from shot to shot.

## Build and review

```sh
node build.mjs                 # writes index.html (dev), dist/the-unmaker-war.html, dist/artifact.html
node tools/gen.mjs             # refreshes the review pages under tools/
node tools/sheet.mjs "shots=0-20&rel=0.6&cols=5" sheet.png   # contact sheet of shots
node tools/sweep.mjs           # renders every shot and reports errors and slow frames
node tools/player-test.mjs .   # drives the built player at desktop and phone sizes
```

The review tools use Playwright with the Chromium build at `/opt/pw-browsers`.
