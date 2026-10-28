#!/bin/bash
# Versión ligera del video para el examen (el artifact acepta archivos de hasta 15 MB): 540p en dos pasadas, audio mono.
# bash scripts/web.sh out/script-ventas.mp4 examen-ventas/video/script-ventas-web.mp4 140k
# Baja el bitrate (tercer argumento, 220k por defecto) si el archivo pasa de 15 MB; un video de 10 min cabe con ~140k.
set -e
FF=${FFMPEG:-ffmpeg}
IN=$1
OUT=$2
BV=${3:-220k}
V="-vf scale=960:540:flags=lanczos -c:v libx264 -preset slow -tune animation -b:v $BV -g 60"
mkdir -p "$(dirname "$OUT")"
P=$(mktemp -d)/pass
$FF -hide_banner -loglevel error -y -i "$IN" $V -pass 1 -passlogfile "$P" -an -f null /dev/null
$FF -hide_banner -loglevel error -y -i "$IN" $V -pass 2 -passlogfile "$P" -pix_fmt yuv420p -c:a aac -b:a 48k -ac 1 -movflags +faststart "$OUT"
ls -la "$OUT"
