// Fotogramas de revisión: node scripts/stills.mjs [Composición] 40 300 1200 ... → out/stills/f<cuadro>.png
// Sin composición usa ClienteDificil.
import {bundle} from "@remotion/bundler";
import {renderStill, selectComposition} from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const args = process.argv.slice(2);
const id = isNaN(Number(args[0])) ? args.shift() : "ClienteDificil";
const frames = args.map(Number);
const serveUrl = await bundle({entryPoint: path.join(root, "src/index.ts"), publicDir: path.join(root, "public")});
const composition = await selectComposition({serveUrl, id});
fs.mkdirSync(path.join(root, "out/stills"), {recursive: true});
for (const frame of frames) {
  await renderStill({composition, serveUrl, frame, output: path.join(root, `out/stills/f${frame}.png`), imageFormat: "png", scale: 0.5});
  console.log("✓", frame);
}
fs.rmSync(serveUrl, {recursive: true, force: true});
