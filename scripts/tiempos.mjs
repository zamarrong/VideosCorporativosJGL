// Imprime cuándo empieza y termina cada línea de un video (cuadros y segundos), con la misma cuenta que su timeline.ts.
// Sirve para llenar SECTIONS del examen (s/e en segundos) y para elegir cuadros de stills.mjs.
//   node scripts/tiempos.mjs src/ventas/timeline.ts
import {build} from "esbuild";

const entry = process.argv[2] ?? "src/timeline.ts";
const out = await build({entryPoints: [entry], bundle: true, platform: "node", format: "esm", write: false, logLevel: "error"});
const {TL, TOTAL} = await import("data:text/javascript;base64," + Buffer.from(out.outputFiles[0].text).toString("base64"));
const sec = (f) => (f / 30).toFixed(1).padStart(6);
for (const l of TL) console.log(`${l.id.padEnd(5)} ${String(l.from).padStart(6)}–${String(l.end).padEnd(6)} ${sec(l.from)}s–${sec(l.end)}s  ${l.who}  ${l.text.replace(/\*\*/g, "").slice(0, 60)}`);
console.log(`TOTAL ${TOTAL} cuadros = ${sec(TOTAL)}s`);
