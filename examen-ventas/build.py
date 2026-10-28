# Inserta fuentes y logos (base64) en src.html -> index.html
import base64, pathlib
root = pathlib.Path(__file__).parent; pub = root.parent / "public"  # examen/ y examen-ventas/ comparten public/
# Gotham no viene en el repo (licencia): si falta en public/fonts, el examen usa la fuente de respaldo.
b = lambda p: base64.b64encode((pub / p).read_bytes()).decode() if (pub / p).exists() else ""
html = (root / "src.html").read_text()
for k, p in {"__GOTHAM_400__": "fonts/GothamPro.woff2", "__GOTHAM_500__": "fonts/Gotham-Medium.woff",
             "__GOTHAM_700__": "fonts/Gotham-Bold.woff", "__LOGO_NEGRO__": "brand/logo_negro.svg",
             "__LOGO_BLANCO__": "brand/logo_blanco.svg"}.items():
    html = html.replace(k, b(p))
(root / "index.html").write_text(html)
print("index.html", len(html))
