#!/usr/bin/env python3
"""Turn the Episode 3 markdown script into src/lines.json.

Keeps only narration: drops stage directions *( ... )*, tables, headers and
everything from PRODUCTION NOTES on. Each sentence becomes one line with
  text     what the subtitle shows (designations kept exactly as written)
  speak    what the voice says (letters spaced out so Piper spells them)
  section  scene id
  flag     "" | "inference" | "interpretation"
  pause    seconds of silence after the line
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

import argparse
_ap = argparse.ArgumentParser()
_ap.add_argument("script")
_ap.add_argument("--flag", action="append", default=[], help="section=inference|interpretation|reported")
_ARGS = _ap.parse_args()
SRC = Path(_ARGS.script)
FLAGS = dict(f.split("=", 1) for f in _ARGS.flag)
NUMS = {"ONE": 1, "TWO": 2, "THREE": 3, "FOUR": 4, "FIVE": 5, "SIX": 6, "SEVEN": 7, "EIGHT": 8,
        "NINE": 9, "TEN": 10, "ELEVEN": 11, "TWELVE": 12}


SMALL = {"a", "an", "the", "of", "and", "or", "to", "in", "on", "at", "with", "by", "for", "be", "is"}


def tcase(t):
    ws = t.lower().split()
    orig = t.split()
    out = []
    for i, (w, o) in enumerate(zip(ws, orig)):
        if any(ch.isdigit() for ch in o):
            out.append(o)
        elif i and w in SMALL:
            out.append(w)
        else:
            out.append("-".join(x[:1].upper() + x[1:] for x in w.split("-")))
    return " ".join(out)


def header(line):
    """Map a markdown header to (prefix, section id, chapter label, flag) or None."""
    m = re.match(r"^## COLD OPEN", line)
    if m:
        return (line, "cold", "", FLAGS.get("cold", ""))
    m = re.match(r"^## PART (\w+) — (.+)$", line)
    if m:
        sid = f"p{NUMS[m.group(1)]}"
        return (line, sid, f"Part {m.group(1).title()} — {tcase(m.group(2))}", FLAGS.get(sid, ""))
    m = re.match(r"^## CLOSE — (.+)$", line)
    if m:
        return (line, "close", tcase(m.group(1)), FLAGS.get("close", ""))
    if line.startswith("## OPEN THREAD"):
        return (line, "thread", "Open Thread", "")
    return None


STOP = "## PRODUCTION NOTES"

ACRONYMS = ["USNI", "GAO", "CPS", "LCS", "CRS", "CBO", "HII", "ONI", "PLA", "CNO",
            "DDG", "CVN", "SSN", "USS", "FY", "AGS", "BC", "U.S.", "R&D", "FF(X)"]


ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()


def two(n):
    if n < 20:
        return ONES[n]
    t, o = divmod(n, 10)
    return TENS[t] + ("-" + ONES[o] if o else "")


def plural(w):
    return w[:-1] + "ies" if w.endswith("y") else w + "s"


def year_words(m):
    y, s = int(m.group(1)), m.group(2)
    hi, lo = divmod(y, 100)
    if 2000 <= y <= 2009:
        base = "two thousand" + ("" if lo == 0 else " " + ONES[lo])
        return "two thousands" if s and lo == 0 else base
    if lo == 0:
        return two(hi) + (" hundreds" if s else " hundred")
    if s:
        return two(hi) + " " + plural(two(lo))
    if lo < 10:
        return two(hi) + " oh " + ONES[lo]
    return two(hi) + " " + two(lo)


def desig_words(n):
    h, lo = divmod(n, 100)
    if lo == 0:
        return ONES[h] + " hundred"
    if lo < 10:
        return ONES[h] + " oh " + ONES[lo]
    return ONES[h] + " " + two(lo)


def designations(s):
    # Boeing airliner families: 707, 737, 747, 767, 777, 787 -> "seven thirty-seven"
    s = re.sub(r"(\d)-(\d)", r"\1 \2", s)
    s = re.sub(r"\b(7[0-8]7) (\d00)(s?)", lambda m: desig_words(int(m.group(1))) + " " + desig_words(int(m.group(2))) + m.group(3), s)
    s = re.sub(r"\b7([0-8])7(s?)\b", lambda m: desig_words(int(m.group(0)[:3])) + m.group(2), s)
    # 3-digit numbers that follow letters in a designation: KC 135, A320, F135, BR725, XA102
    s = re.sub(r"\b([A-Z]{1,4})(\s?)(\d{3})(?![\d.,])", lambda m: m.group(1) + " " + desig_words(int(m.group(3))), s)
    return s


def speakable(t: str) -> str:
    s = t
    s = s.replace("—", ", ").replace("–", " to ")
    s = s.replace("R&D", "R and D").replace("FF(X)", "F F X").replace("U.S.", "U S")
    s = re.sub(r"~\s*", "about ", s)
    s = s.replace("Flight III", "Flight Three")
    s = re.sub(r"\bPentagon", "Pentagahn", s)
    s = re.sub(r"(?<![\d,.$])\b(1[1-9]\d\d|20\d\d)(s?)\b(?!\d)(?!,\d)", year_words, s)
    s = re.sub(r"\$([\d.,]+) to \$([\d.,]+)\s*(billion|million)", r"\1 to \2 \3 dollars", s)
    # $13.3 billion -> 13.3 billion dollars ; $362 million -> 362 million dollars
    s = re.sub(r"\$([\d.,]+)\s*(billion|million|trillion)", r"\1 \2 dollars", s)
    s = re.sub(r"\$([\d.,]+)B\b", r"\1 billion dollars", s)
    s = re.sub(r"\$([\d.,]+)", r"\1 dollars", s)
    # FY2026 -> F Y 2026
    s = re.sub(r"\bFY\s?(\d{2,4})", r"F Y \1", s)
    s = re.sub(r"(?<![\d,.$])\b(1[1-9]\d\d|20\d\d)(s?)\b(?!\d)(?!,\d)", year_words, s)
    # letter-number hyphen: CVN-78 -> CVN 78, F-16 -> F 16
    s = re.sub(r"([A-Za-z])-(\d)", r"\1 \2", s)
    s = re.sub(r"(?<=\s)-(\d)", r"\1", s)
    s = designations(s)
    s = re.sub(r"([a-z])([A-Z])\b", r"\1 \2", s)
    for a in ["USNI", "GAO", "CPS", "LCS", "CRS", "CBO", "HII", "ONI", "PLA", "CNO",
              "DDG", "CVN", "SSN", "USS", "AGS", "BC", "PTMS", "NVCA", "AI", "FPV", "RTX", "BAE", "YFQ", "PBAS", "JPO", "CIA", "FAA", "IAI", "BCF", "BDSF", "SF", "AGM", "SR"]:
        s = re.sub(rf"\b{a}\b", " ".join(a), s)
    s = s.replace("LRASM", "L-Rasm").replace("15IA", "15 I A").replace("hundredERX", "hundred E R X").replace("15Ds", "15 Dees")
    s = s.replace("2,292,387", "two, two nine two, three eight seven").replace("£1,000", "a thousand pounds").replace("OODA", "OO-dah").replace("SU-Net", "S U Net")
    s = s.replace("EPACS", "Ee-packs").replace("IKEA", "Eye-kia")
    s = s.replace('"', "").replace("“", "").replace("”", "")
    return re.sub(r"\s+", " ", s).strip()


def clean(t: str) -> str:
    t = re.sub(r"\*\(.*?\)\*", "", t)
    t = re.sub(r"\*\*(.+?)\*\*", r"\1", t)
    t = re.sub(r"(?<!\w)\*(.+?)\*(?!\w)", r"\1", t)
    t = t.replace("`", "")
    t = re.sub(r"\*\(.*?\)\*", "", t)
    return re.sub(r"\s+", " ", t).strip()


SENT = re.compile(r"(?<=[.!?])[\"”’]?\s+(?=[A-Z\"“$0-9(])")


def sentences(par: str):
    out = []
    # protect initials and abbreviations (George H.W. Bush, Gerald R. Ford, U.S.) from the splitter
    par = re.sub(r"\b([A-Z])\.", lambda m: m.group(1) + "\u2024", par)
    for s in SENT.split(par):
        s = s.replace("\u2024", ".")
        s = s.strip()
        if not s:
            continue
        # split very long sentences at a semicolon or a comma near the middle
        while len(s) > 170:
            mid = len(s) // 2
            cands = [m.start() for m in re.finditer(r"[;:,] ", s)]
            if not cands:
                break
            cut = min(cands, key=lambda i: abs(i - mid))
            if cut < 40 or len(s) - cut < 40:
                break
            out.append(s[: cut + 1].strip())
            s = s[cut + 2 :].strip()
            s = s[0].upper() + s[1:] if s and s[0].islower() and False else s
        out.append(s)
    return out


def main():
    text = SRC.read_text(encoding="utf-8")
    lines = []
    sec = None
    para = []

    def flush(pause=0.8):
        nonlocal para
        if para and sec:
            p = clean(" ".join(para))
            ss = sentences(p)
            for i, s in enumerate(ss):
                lines.append({"section": sec[1], "text": s, "speak": speakable(s),
                              "flag": sec[3], "pause": 0.35 if i < len(ss) - 1 else pause})
        para = []

    for raw in text.splitlines():
        line = raw.rstrip()
        if line.startswith(STOP):
            flush(2.0)
            break
        hit = header(line)
        if hit:
            flush(1.6)
            if lines:
                lines[-1]["pause"] = max(lines[-1]["pause"], 2.0)
            sec = hit
            if hit[2]:
                lines.append({"section": hit[1], "text": "", "speak": "", "flag": hit[3],
                              "pause": 2.6, "chapter": hit[2]})
            continue
        if sec is None:
            continue
        s = line.strip()
        if not s or s == "---":
            flush()
            continue
        if s.startswith("### "):
            flush()
            continue
        if s.startswith("|"):
            flush()
            continue
        if s.startswith("*(") and s.endswith(")*"):
            flush()
            if "Beat" in s and lines:
                lines[-1]["pause"] = max(lines[-1]["pause"], 1.4)
            continue
        if s.startswith("- "):
            flush()
            para = [s[2:]]
            flush(0.6)
            continue
        para.append(s)
    flush(2.0)

    # title card after the cold open, end card at the very end
    idx = next(i for i, l in enumerate(lines) if l["section"] != "cold")
    lines.insert(idx, {"section": "title", "text": "", "speak": "", "flag": "", "pause": 5.0})
    lines.append({"section": "end", "text": "", "speak": "", "flag": "", "pause": 10.0})

    out = ROOT / "src" / "lines.json"
    out.write_text(json.dumps(lines, indent=1, ensure_ascii=False), encoding="utf-8")
    spoken = [l for l in lines if l["text"]]
    words = sum(len(l["text"].split()) for l in spoken)
    print(f"{len(lines)} lines, {len(spoken)} spoken, {words} words -> {out}")


if __name__ == "__main__":
    main()
