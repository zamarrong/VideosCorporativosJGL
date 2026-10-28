"""Imprime el cuadro de inicio/fin de cada línea (misma lógica que src/timeline.ts)."""
import json, math
vo = json.load(open("src/vo.json")); lines = json.load(open("audio-src/lines.json"))
t = 105; out = {}
for i, l in enumerate(lines):
    n = lines[i + 1] if i + 1 < len(lines) else None
    ln = math.ceil(vo[l["id"]]["dur"] * 30)
    out[l["id"]] = (t, t + ln)
    gap = 0 if not n else 16 if (l["who"] == "N" or n["who"] == "N") else 40 if n["id"] == "r06" else 9
    t += ln + gap
total = t - 0 + 150
if __name__ == "__main__":
    for k, v in out.items(): print(k, v)
    print("TOTAL", total, total / 30)
