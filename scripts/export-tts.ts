// Texto para ElevenLabs, una toma por voz: audio-src/tts-N.txt, tts-M.txt, tts-R.txt (un párrafo por línea, en orden).
import fs from "node:fs";
import {LINES, spoken} from "../src/script.ts";
for (const who of ["N", "M", "R"] as const) {
  const ls = LINES.filter((l) => l.who === who);
  fs.writeFileSync(`audio-src/tts-${who}.txt`, ls.map(spoken).join("\n\n[pause]\n\n") + "\n");
  console.log(who, ls.length, "líneas", ls.map(spoken).join(" ").length, "caracteres");
}
