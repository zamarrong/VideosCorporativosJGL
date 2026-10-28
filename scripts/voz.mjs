// Genera una toma de voz con la API de ElevenLabs y la transcribe con scribe, en el formato que esperan cut-vo*.py:
//   node scripts/voz.mjs <VOZ> <carpeta> <voice_id | nombre de variable del .env>
//   node scripts/voz.mjs N audio-src/ventas VOICE_NARRADORA
// Lee <carpeta>/tts-<VOZ>.txt y escribe <carpeta>/<VOZ>-a.mp3 y <carpeta>/words-<VOZ>.json.
// La key sale de .env (ELEVENLABS_API_KEY); copia .env.example a .env.
import fs from "node:fs";

if (fs.existsSync(".env")) process.loadEnvFile(".env");
const KEY = process.env.ELEVENLABS_API_KEY;
const [who, dir, voiceArg] = process.argv.slice(2);
if (!KEY) throw new Error("Falta ELEVENLABS_API_KEY en .env (ver .env.example)");
if (!who || !dir || !voiceArg) throw new Error("Uso: node scripts/voz.mjs <VOZ> <carpeta> <voice_id|VARIABLE>");

const voice = process.env[voiceArg] ?? voiceArg;
const text = fs.readFileSync(`${dir}/tts-${who}.txt`, "utf8");
// Arriba de ~5000 caracteres la API rechaza el texto: parte el guion de esa voz en dos tomas (como A1/A2 en ventas).
if (text.length > 5000) throw new Error(`tts-${who}.txt tiene ${text.length} caracteres; pártelo en dos tomas`);

const api = (path, init) =>
  fetch(`https://api.elevenlabs.io${path}`, {...init, headers: {"xi-api-key": KEY, ...init.headers}}).then(async (r) => {
    if (!r.ok) throw new Error(`${path}: ${r.status} ${await r.text()}`);
    return r;
  });

console.log(`Voz ${who}: ${text.length} caracteres con ${voice}…`);
const tts = await api(`/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify({text, model_id: process.env.ELEVENLABS_MODEL || "eleven_v3"}),
});
const mp3 = Buffer.from(await tts.arrayBuffer());
fs.writeFileSync(`${dir}/${who}-a.mp3`, mp3);

const form = new FormData();
form.append("model_id", process.env.ELEVENLABS_STT_MODEL || "scribe_v1");
form.append("language_code", "spa");
form.append("timestamps_granularity", "word");
form.append("file", new Blob([mp3], {type: "audio/mpeg"}), `${who}-a.mp3`);
const stt = await (await api("/v1/speech-to-text", {method: "POST", body: form})).json();
const words = stt.words.map(({text, type, start, end}) => ({text, type, start, end}));
fs.writeFileSync(`${dir}/words-${who}.json`, JSON.stringify(words, null, 2));
console.log(`Listo: ${dir}/${who}-a.mp3 y words-${who}.json (${words.filter((w) => w.type === "word").length} palabras)`);
