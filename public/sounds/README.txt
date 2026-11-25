OPTIONAL CUSTOM MP3 OVERRIDE FOLDER — JIMSA GAMES
==================================================

Jimsa Games already includes a built-in cinematic synthesizer + singing Doll voice
("Aao sab khelein... Green Light / Red Light!") out of the box.

If you want to use your own exact MP3 tracks (for example, downloaded OST tracks),
simply drop MP3 files with these exact names into THIS folder (frontend/public/sounds/):

  - bgm-rlgl.mp3        -> Background music for Red Light, Green Light
  - bgm-bridge.mp3      -> Background music for Glass Bridge
  - doll-song.mp3       -> Custom doll singing clip played during Green Light
  - red-light.mp3       -> Sound played when the doll turns for Red Light
  - gunshot.mp3         -> Elimination shot sound
  - glass-shatter.mp3   -> Glass breaking sound
  - victory.mp3         -> Match winner fanfare

The game automatically detects and plays any MP3 you place here, and falls back
smoothly to the built-in cinematic soundtrack & doll voice for any missing file!
