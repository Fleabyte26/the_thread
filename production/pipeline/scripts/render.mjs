// Render the episode one section per file into out/parts, skipping finished ones.
// node scripts/render.mjs [sectionId ...]   (no args = all sections)
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const cap = JSON.parse(fs.readFileSync(path.join(root, "src/captions.json"), "utf8"));
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const only = process.argv.slice(2);
const partsDir = path.join(root, "out/parts");
fs.mkdirSync(partsDir, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts") });
const composition = await selectComposition({ serveUrl, id: "Ep4", inputProps: {}, browserExecutable });
const last = composition.durationInFrames - 1;
const secs = cap.sections;
for (let i = 0; i < secs.length; i++) {
  const s = secs[i];
  if (only.length && !only.includes(s.id)) continue;
  const a = Math.round(s.start * 30) * (i === 0 ? 0 : 1);
  const b = i === secs.length - 1 ? last : Math.round(secs[i + 1].start * 30) - 1;
  const name = `${String(i).padStart(2, "0")}_${s.id}`;
  const final = path.join(partsDir, `${name}.mp4`);
  if (fs.existsSync(final)) { console.log("skip", name); continue; }
  const tmp = path.join(partsDir, `${name}.part.mp4`);
  const t0 = Date.now();
  await renderMedia({
    composition, serveUrl, codec: "h264", outputLocation: tmp, inputProps: {}, browserExecutable,
    frameRange: [a, b], muted: true, crf: 20, x264Preset: "veryfast", concurrency: 2,
    onProgress: ({ progress }) => { if (Math.round(progress * 100) % 25 === 0) process.stdout.write(`\r${name} ${Math.round(progress * 100)}%   `); },
  });
  fs.renameSync(tmp, final);
  const dt = (Date.now() - t0) / 1000;
  console.log(`\n${name}: frames ${a}-${b} (${b - a + 1}) in ${dt.toFixed(0)}s = ${((b - a + 1) / dt).toFixed(1)} fps`);
}
console.log("done");
