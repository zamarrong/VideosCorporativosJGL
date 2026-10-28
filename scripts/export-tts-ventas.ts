// Texto para ElevenLabs del video ScriptVentas: audio-src/ventas/tts-<voz>.txt (un párrafo por línea, separados por [pause]).
import fs from "node:fs";
import {LINES, spoken} from "../src/ventas/script.ts";
fs.writeFileSync("audio-src/ventas/lines.json", JSON.stringify(LINES.map((l) => ({id: l.id, who: l.who, text: l.text, spk: spoken(l).replace(/\[[^\]]*\]/g, " ").replace(/\s+/g, " ").trim()})), null, 1));
for (const who of ["N", "A", "P", "J", "C"] as const) {
  const ls = LINES.filter((l) => l.who === who);
  fs.writeFileSync(`audio-src/ventas/tts-${who}.txt`, ls.map(spoken).join("\n\n[pause]\n\n") + "\n");
  console.log(who, ls.length, "líneas", ls.map(spoken).join(" ").length, "caracteres");
}
