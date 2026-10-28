"""Corta las tomas del video ScriptVentas en un clip por línea y escribe public/audio/ventas/<id>.wav + src/ventas/vo.json.
A diferencia de cut-vo.py, scribe no devuelve los [pause]: los límites de cada línea salen de alinear todo el texto hablado
de la voz (lines.json → spk) contra las palabras transcritas. El asesor va en dos tomas (A1: a01–a16, A2: a17–a28).
vo.json[id] = {dur, tok: [[s, e], ...]} con un par por cada palabra de `text` (split por espacios), en segundos del clip."""
import json, os, re, subprocess, unicodedata, difflib
FF = os.environ.get("FFMPEG", "ffmpeg")
D = "audio-src/ventas"
lines = json.load(open(f"{D}/lines.json"))

def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    w = "".join(c for c in w if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", w)

A = [l for l in lines if l["who"] == "A"]
TAKES = [("N", None), ("P", None), ("J", None), ("C", None), ("A1", A[:16]), ("A2", A[16:])]

out = {}
for take, mine in TAKES:
    mine = mine or [l for l in lines if l["who"] == take]
    words = [w for w in json.load(open(f"{D}/words-{take}.json")) if w["type"] == "word" and norm(w["text"])]
    sn = [norm(w["text"]) for w in words]
    # Texto esperado, palabra por palabra, con la línea a la que pertenece.
    exp, owner = [], []
    for li, l in enumerate(mine):
        for x in l["spk"].split():
            if norm(x):
                exp.append(norm(x)); owner.append(li)
    sm = difflib.SequenceMatcher(a=exp, b=sn, autojunk=False)
    hit = {}  # línea → índices de palabras transcritas
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            hit.setdefault(owner[blk.a + k], []).append(blk.b + k)
    spans = []
    for li in range(len(mine)):
        idx = hit.get(li)
        assert idx, (take, mine[li]["id"], "sin palabras alineadas")
        spans.append((min(idx), max(idx)))
    for li, l in enumerate(mine):
        i0, i1 = spans[li]
        # Palabras no alineadas entre esta línea y la siguiente se quedan con la que esté más cerca en el tiempo.
        seg = words[i0:i1 + 1]
        prev_end = words[spans[li - 1][1]]["end"] if li else 0
        next_start = words[spans[li + 1][0]]["start"] if li + 1 < len(mine) else seg[-1]["end"] + 1
        a = max(prev_end + 0.05, seg[0]["start"] - 0.1)
        b = min(next_start - 0.05, seg[-1]["end"] + 0.35)
        subprocess.run([FF, "-y", "-loglevel", "error", "-ss", f"{a:.3f}", "-to", f"{b:.3f}", "-i", f"{D}/{take}-a.mp3",
                        "-af", "highpass=f=80,afade=t=in:d=0.02,areverse,afade=t=in:d=0.08,areverse", "-ar", "48000",
                        f"public/audio/ventas/{l['id']}.wav"], check=True)
        # Alinea las palabras de pantalla con las habladas.
        disp = l["text"].replace("**", "").split()
        dn = [norm(x) for x in disp]
        tok = [None] * len(disp)
        m2 = difflib.SequenceMatcher(a=dn, b=[norm(w["text"]) for w in seg], autojunk=False)
        for blk in m2.get_matching_blocks():
            for k in range(blk.size):
                w = seg[blk.b + k]
                tok[blk.a + k] = [round(w["start"] - a, 3), round(w["end"] - a, 3)]
        # Un hueco de pantalla ("ochenta y dos", [importe confirmado]) frente a un hueco hablado ("82", "le doy el costo")
        # se reparte el tiempo de lo que sí se dijo.
        blks = m2.get_matching_blocks()
        for p, q in zip([None] + blks[:-1], blks):
            da, db = (p.a + p.size if p else 0), q.a
            sa, sb = (p.b + p.size if p else 0), q.b
            if da < db and sa < sb:
                t0, t1 = seg[sa]["start"] - a, seg[sb - 1]["end"] - a
                n = db - da
                for k in range(n):
                    tok[da + k] = [round(t0 + (t1 - t0) * k / n, 3), round(t0 + (t1 - t0) * (k + 1) / n, 3)]
        # Las que no se dicen heredan el tiempo de la anterior.
        last = [0.0, 0.0]
        for k in range(len(tok)):
            if tok[k] is None: tok[k] = [last[1], last[1]]
            last = tok[k]
        miss = [disp[k] for k in range(len(disp)) if not any(blk.a <= k < blk.a + blk.size for blk in m2.get_matching_blocks())]
        heard = " ".join(w["text"] for w in seg)
        extra = len(seg) - sum(blk.size for blk in m2.get_matching_blocks())
        out[l["id"]] = {"dur": round(b - a, 3), "tok": tok}
        print(f"{l['id']} {b-a:5.2f}s", f"sin voz: {' '.join(miss)}" if miss else "", f"| +{extra} oídas" if extra > 2 else "")
json.dump(out, open("src/ventas/vo.json", "w"))
print(len(out), "líneas")
