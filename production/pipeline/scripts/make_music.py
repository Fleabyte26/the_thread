#!/usr/bin/env python3
"""Generate public/music.wav: a quiet, slow drone that changes chord at each
section. Silent during the cold open. Nothing sampled, nothing to license."""
import json
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
cap = json.loads((ROOT / "public" / "captions.json").read_text())
RATE = 48000
dur = cap["duration"]
N = int(dur * RATE)
t = np.arange(N) / RATE
out = np.zeros(N, np.float32)

# root notes (Hz) per section: low, a little uneasy; brighter for the Iowa and counter-thread
ROOTS = {"title": 55.0, "p1": 49.0, "p2": 51.9, "p3": 46.2, "p4": 55.0, "p4b": 55.0,
         "p5": 43.7, "p6": 65.4, "p7": 49.0, "p8": 41.2, "p9": 46.2, "p10": 51.9,
         "p11": 58.3, "thread": 55.0, "end": 55.0}
MINOR = {"p1", "p2", "p3", "p5", "p7", "p8", "p9", "p10"}

rng = np.random.default_rng(3)
for s in cap["sections"]:
    if s["id"] == "cold":
        continue
    a, b = int(s["start"] * RATE), int(s["end"] * RATE)
    seg_t = t[a:b] - s["start"]
    root = ROOTS.get(s["id"], 55.0)
    third = root * (2 ** (3 / 12) if s["id"] in MINOR else 2 ** (4 / 12))
    fifth = root * 2 ** (7 / 12)
    sig = np.zeros(b - a, np.float32)
    for f, g in [(root, 1.0), (root * 2, 0.5), (third * 2, 0.35), (fifth * 2, 0.3), (root * 4, 0.08)]:
        lfo = 0.6 + 0.4 * np.sin(2 * np.pi * (0.03 + 0.02 * rng.random()) * seg_t + rng.random() * 6)
        sig += g * lfo * np.sin(2 * np.pi * f * seg_t + rng.random() * 6) * 0.5
        sig += g * 0.5 * lfo * np.sin(2 * np.pi * f * 1.003 * seg_t)
    # soft fades at section edges
    fade = int(min(4.0, (b - a) / RATE / 3) * RATE)
    env = np.ones(b - a, np.float32)
    env[:fade] = np.linspace(0, 1, fade)
    env[-fade:] = np.minimum(env[-fade:], np.linspace(1, 0, fade))
    out[a:b] += sig * env

out = out / (np.max(np.abs(out)) or 1) * 0.5
pcm = (out * 32767).astype(np.int16)
with wave.open(str(ROOT / "public" / "music.wav"), "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(RATE)
    w.writeframes(pcm.tobytes())
print(f"music.wav {dur/60:.2f} min")
