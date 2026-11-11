// Render check stills at given times (seconds): node scripts/stills.mjs 20 190 805 ...
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const times = process.argv.slice(2).map(Number);
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts") });
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const composition = await selectComposition({ serveUrl, id: "Ep4", inputProps: {}, browserExecutable });
for (const t of times) {
  const frame = Math.round(t * 30);
  const output = path.join(root, "out", "stills", `t${String(t).padStart(5, "0")}.jpg`);
  await renderStill({ composition, serveUrl, output, frame, imageFormat: "jpeg", jpegQuality: 85, inputProps: {}, browserExecutable });
  console.log(output);
}
