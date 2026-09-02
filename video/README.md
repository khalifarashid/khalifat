# Craftbyte Reel — Remotion motion graphics

A 30.6s 9:16 promo reel (1080×1920, 30fps, h264 + AAC) built with Remotion.

    npm install
    npm run studio     # live preview
    npm run build      # render to out/craftbyte-reel.mp4

## Structure

    src/theme.ts              single source of truth — colors, easings, spring presets
    src/fonts.ts              self-hosted Space Grotesk + Archivo (no render-time network)
    src/Video.tsx             timeline + audio bed; all timing derives from fps
    src/Root.tsx              composition registration
    src/components/Layers.tsx background mesh, drifting grid, grade, grain, vignette
    src/components/Motion.tsx Entrance, Scene, WordReveal, KenBurns, Counter, SparkMark, Wipe
    src/scenes/               Hook, Claim, Work, Stats, Cta
    scripts/gen-sfx.mjs       synthesizes the SFX kit + music bed as WAVs
    public/shots/             headless-Chromium screenshots of the demo sites
    stills/                   one verification frame per scene

## Timing

Cuts land on the beat: the bed runs at 100 BPM, so `framesPerBeat = fps * 60 / 100 = 18`
and every scene length is a whole number of beats.

    hook   108f   3.6s   logo sting
    claim  126f   4.2s   positioning line
    work   126f x3       three case studies, Ken Burns on real screenshots
    stats  162f   5.4s   animated counters
    cta    144f   4.8s   close

## Assets

`public/shots/*.png` are screenshots of the demo sites in `../demos`, captured with the
pre-installed headless Chromium at 1440×1800. Regenerate with:

    chrome --headless --window-size=1440,1800 --virtual-time-budget=8000 \
      --screenshot=public/shots/<name>.png file://<abs-path>/demos/<name>/index.html

`meridian-cole` is intentionally not used: its hero pulls images from an external host,
so it screenshots as a blurred placeholder in a sandbox.

`public/sfx/*.wav` are generated, not downloaded — run `node scripts/gen-sfx.mjs`.

## Known nit

Space Grotesk's `1` renders its angled flag as a slightly lighter wedge against the stem
at 168px. It is a glyph/antialiasing artifact in the variable font, not a layer bug
(it survives with the grain and grade layers removed), and it is not visible in motion.
