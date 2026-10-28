"""Corta cada toma (audio-src/<voz>-a.mp3) en un clip por línea usando los tiempos de palabra de scribe
(audio-src/words-<voz>.json) y escribe public/audio/<id>.wav + src/vo.json.
vo.json[id] = {dur, tok: [[s, e], ...]} con un par por cada palabra de `text` (split por espacios), en segundos del clip."""
import json, os, re, subprocess, unicodedata, difflib, sys
FF = os.environ.get("FFMPEG", "ffmpeg")
TAKE = {"N": "a", "M": "a", "R": "a"}
lines = json.load(open("audio-src/lines.json"))

def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    w = "".join(c for c in w if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9ñ]", "", w)

out = {}
for who in "NMR":
    words = json.load(open(f"audio-src/words-{who}.json"))
    segs, cur = [], []
    for w in words:
        if w["type"] != "word":
            continue
        t = w["text"]
        if t == "[pause]":
            if cur: segs.append(cur); cur = []
            continue
        if t.startswith("[") or t.endswith("]"):
            continue
        cur.append(w)
    if cur: segs.append(cur)
    mine = [l for l in lines if l["who"] == who]
    assert len(segs) == len(mine), (who, len(segs), len(mine))
    for i, (l, seg) in enumerate(zip(mine, segs)):
        prev_end = segs[i - 1][-1]["end"] if i else 0
        next_start = segs[i + 1][0]["start"] if i + 1 < len(segs) else seg[-1]["end"] + 1
        a = max(prev_end + 0.05, seg[0]["start"] - 0.1)
        b = min(next_start - 0.05, seg[-1]["end"] + 0.35)
        src = f"audio-src/{who}-{TAKE[who]}.mp3"
        subprocess.run([FF, "-y", "-loglevel", "error", "-ss", f"{a:.3f}", "-to", f"{b:.3f}", "-i", src,
                        "-af", "highpass=f=80,afade=t=in:d=0.02,areverse,afade=t=in:d=0.08,areverse", "-ar", "48000", f"public/audio/{l['id']}.wav"], check=True)
        # Alinea las palabras de pantalla con las habladas.
        disp = l["text"].split()
        dn = [norm(x) for x in disp]
        sn = [norm(w["text"]) for w in seg]
        tok = [None] * len(disp)
        sm = difflib.SequenceMatcher(a=dn, b=sn, autojunk=False)
        for blk in sm.get_matching_blocks():
            for k in range(blk.size):
                w = seg[blk.b + k]
                tok[blk.a + k] = [round(w["start"] - a, 3), round(w["end"] - a, 3)]
        # Las que no se dicen ([monto], etc.) heredan el tiempo de la anterior.
        last = [0.0, 0.0]
        for k in range(len(tok)):
            if tok[k] is None: tok[k] = [last[1], last[1]]
            last = tok[k]
        miss = [disp[k] for k in range(len(disp)) if not any(blk.a <= k < blk.a + blk.size for blk in sm.get_matching_blocks())]
        out[l["id"]] = {"dur": round(b - a, 3), "tok": tok}
        print(l["id"], f"{b-a:5.2f}s", "sin voz:" if miss else "", " ".join(miss))
json.dump(out, open("src/vo.json", "w"))
