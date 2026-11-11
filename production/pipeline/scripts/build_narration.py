#!/usr/bin/env python3
"""Build public/narration.wav, public/captions.json and out/the-thread-ep4.en.srt
from src/lines.json.

Each line is synthesized on its own, so every subtitle gets an exact start and
end. Lines with empty text are silent gaps (title card, chapter cards, end card).

Voice: PIPER_VOICE=/path/to/voice.onnx (default: Piper's test voice, same as Ep 1-2).
"""
import io
import json
import os
import wave
from pathlib import Path

import numpy as np
from piper import PiperVoice, SynthesisConfig

ROOT = Path(__file__).resolve().parent.parent
LINES = ROOT / "src" / "lines.json"
PUBLIC = ROOT / "public"
OUT = ROOT / "out"
PUBLIC.mkdir(exist_ok=True)
OUT.mkdir(exist_ok=True)

VOICE = os.environ.get("PIPER_VOICE", "/tmp/piper/test_voice.onnx")
LENGTH_SCALE = float(os.environ.get("PIPER_LENGTH", "1.04"))
RATE = 48000
LEAD_IN = 0.8

voice = PiperVoice.load(VOICE)
cfg = SynthesisConfig(length_scale=LENGTH_SCALE, noise_scale=0.5, noise_w_scale=0.6)
in_rate = voice.config.sample_rate


def synth(text):
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        voice.synthesize_wav(text, w, cfg)
    buf.seek(0)
    with wave.open(buf, "rb") as w:
        pcm = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16)
    x = pcm.astype(np.float32) / 32768.0
    n = int(round(len(x) * RATE / in_rate))
    x = np.interp(np.linspace(0, len(x), n, endpoint=False), np.arange(len(x)), x).astype(np.float32)
    # trim leading/trailing near-silence
    a = np.abs(x)
    idx = np.where(a > 0.01)[0]
    if len(idx):
        x = x[max(0, idx[0] - 480): min(len(x), idx[-1] + 2400)]
    return x


def srt_time(t):
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def main():
    lines = json.loads(LINES.read_text(encoding="utf-8"))
    chunks = [np.zeros(int(LEAD_IN * RATE), np.float32)]
    t = LEAD_IN
    cues = []
    for i, l in enumerate(lines):
        start = t
        if l.get("text"):
            x = synth(l.get("speak") or l["text"])
            chunks.append(x)
            t += len(x) / RATE
        end = t
        gap = float(l.get("pause", 0.4))
        chunks.append(np.zeros(int(gap * RATE), np.float32))
        t += gap
        cues.append({"i": i, "section": l["section"], "text": l.get("text", ""),
                     "flag": l.get("flag", ""), "chapter": l.get("chapter", ""),
                     "start": round(start, 3), "end": round(end, 3), "next": round(t, 3)})
        if i % 50 == 0:
            print(f"{i}/{len(lines)}  {t/60:.1f} min", flush=True)

    audio = np.concatenate(chunks)
    peak = np.max(np.abs(audio)) or 1.0
    audio = audio / peak * 0.89
    pcm = (audio * 32767).astype(np.int16)
    with wave.open(str(PUBLIC / "narration.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(pcm.tobytes())

    # section boundaries: a section runs from its first cue's start to the next section's start
    sections = []
    for c in cues:
        if not sections or sections[-1]["id"] != c["section"]:
            sections.append({"id": c["section"], "start": c["start"]})
    for a, b in zip(sections, sections[1:]):
        a["end"] = b["start"]
    sections[-1]["end"] = round(t, 3)

    total = round(t, 3)
    (PUBLIC / "captions.json").write_text(json.dumps({"duration": total, "cues": cues, "sections": sections}, indent=0))

    n = 0
    srt = []
    for c in cues:
        if not c["text"]:
            continue
        n += 1
        srt.append(f"{n}\n{srt_time(c['start'])} --> {srt_time(c['end'] + 0.15)}\n{c['text']}\n")
    (OUT / "the-thread-ep4.en.srt").write_text("\n".join(srt), encoding="utf-8")
    print(f"done: {total/60:.2f} min, {n} subtitles")


if __name__ == "__main__":
    main()
