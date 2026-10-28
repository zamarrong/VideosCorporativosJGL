#!/bin/bash
# Master: loudnorm en dos pasadas (mide y luego aplica lineal) a -14 LUFS, yuv420p y faststart.
set -e
FF=${FFMPEG:-ffmpeg}
IN=${1:-out/cliente-dificil-raw.mp4}
OUT=${2:-out/cliente-dificil.mp4}
J=$($FF -hide_banner -nostats -i "$IN" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$J" | python3 -c "import json,sys; print(json.load(sys.stdin)['$1'])"; }
$FF -y -loglevel error -i "$IN" -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -color_range tv -movflags +faststart \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true" \
  -ar 48000 -c:a aac -b:a 256k "$OUT"
echo "Listo: $OUT"
