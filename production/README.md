# Production pipeline

How the episode videos are built. Code only; no audio, video or node_modules.

- `pipeline/` — the shared Remotion project (React/TypeScript) and scripts, as used for Episode 4.
  - `scripts/script_to_lines.py <script.md> --flag pN=plan|inference|interpretation` turns an episode script into `src/lines.json` (spoken text with pronunciation fixes for years, designations and acronyms).
  - `scripts/build_narration.py` synthesizes narration with Piper TTS and writes `public/narration.wav`, `public/captions.json` and an English .srt.
  - `scripts/make_music.py` generates the background drone.
  - `scripts/stills.mjs <seconds...>` renders check frames; `scripts/render.mjs` renders each section; `scripts/finish.sh` joins sections and mixes audio.
- `episodes/epN/` — each episode's `Scenes.tsx`, `episode.ts` and generated `lines.json`.

To build an episode: copy `pipeline/` into a project folder, `npm install`, drop in the episode's `Scenes.tsx` and `episode.ts`, run the converter, build narration and music, copy `public/captions.json` to `src/captions.json`, check stills, then render and finish.
