#!/usr/bin/env bash
# Join the section files and add narration + music: out/the-thread-ep4.mp4
set -euo pipefail
cd "$(dirname "$0")/.."
ls out/parts/[0-9]*_*.mp4 | grep -v '\.part\.mp4' | sort | sed "s|^|file '$(pwd)/|; s|$|'|" > out/parts/list.txt
ffmpeg -v error -y -f concat -safe 0 -i out/parts/list.txt -c copy out/video_only.mp4
ffmpeg -v error -y -i public/narration.wav -i public/music.wav \
  -filter_complex "[1:a]volume=0.16[m];[0:a][m]amix=inputs=2:duration=first:normalize=0,aresample=48000[a]" \
  -map "[a]" -c:a pcm_s16le out/mix.wav
ffmpeg -v error -y -i out/video_only.mp4 -i out/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart out/the-thread-ep4.tmp.mp4
mv out/the-thread-ep4.tmp.mp4 out/the-thread-ep4.mp4
ffprobe -v error -show_entries format=duration,size -of default=nw=1 out/the-thread-ep4.mp4
