#!/bin/sh
# usage: sh scripts_stills.sh 1,2,3   -> renders stills and a contact sheet out/sheet.jpg
export CHROME_PATH=${CHROME_PATH:-/opt/pw-browsers/chromium-1194/chrome-linux/chrome}
rm -f out/stills/*.png
node render.js --stills "$1" 2>&1 | grep -v "^\s*$" | grep -v "^still" | tail -20
ffmpeg -v error -y -pattern_type glob -i 'out/stills/*.png' -vf "scale=480:-1,tile=4x${2:-6}" -frames:v 1 out/sheet.jpg
