#!/usr/bin/env python3
"""Build the final soundtrack for the «مكتبي AI» video.

- Keeps the original narration + music bed.
- Adds the recorded intro voice (assets/voice-intro.m4a) over the music-only intro.
- Fills the silent gap at ~2:10 of the original with assets/voice-2m12.m4a
  (the three sentences about smart desktop notifications), stretching the
  music bed instead of speeding up the voice, and keeps the notification chime.
- Extends the ending a little so the credits card has room.

Writes build/soundtrack.wav and build/timeline.json (time mapping used by scene.html).
"""
import json, os, subprocess, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
A = lambda *p: os.path.join(HERE, *p)
SR = 44100
XF = 0.25  # crossfade seconds between music-bed pieces


def decode(path, channels, filters=None):
    cmd = ["ffmpeg", "-v", "error", "-i", path]
    if filters:
        cmd += ["-af", filters]
    cmd += ["-ac", str(channels), "-ar", str(SR), "-f", "f32le", "-"]
    raw = subprocess.run(cmd, check=True, capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, channels).astype(np.float64)


def sl(x, a, b):
    return x[int(round(a * SR)):int(round(b * SR))].copy()


def fade(x, fin=0.0, fout=0.0):
    x = x.copy()
    n = len(x)
    if fin > 0:
        k = min(n, int(fin * SR))
        x[:k] *= np.sin(np.linspace(0, np.pi / 2, k))[:, None] ** 2
    if fout > 0:
        k = min(n, int(fout * SR))
        x[n - k:] *= np.cos(np.linspace(0, np.pi / 2, k))[:, None] ** 2
    return x


class Track:
    """Crossfaded concatenation of music-bed pieces, remembering where each piece lands."""

    def __init__(self):
        self.buf = np.zeros((0, 2))
        self.marks = []  # (new_start, orig_start, orig_end)

    def add(self, x, orig_a, orig_b, xf=XF):
        if len(self.buf) == 0:
            self.marks.append((0.0, orig_a, orig_b))
            self.buf = x
            return
        k = int(xf * SR)
        start = len(self.buf) - k
        self.marks.append((start / SR, orig_a, orig_b))
        t = np.linspace(0, np.pi / 2, k)[:, None]
        out = np.zeros((start + len(x), 2))
        out[:len(self.buf)] = self.buf
        out[start:start + k] *= np.cos(t)
        out[start:start + k] += x[:k] * np.sin(t)
        out[start + k:] = x[k:]
        self.buf = out

    def piece(self, orig, a, b, xf=XF):
        self.add(sl(orig, a, b), a, b, xf)

    @property
    def dur(self):
        return len(self.buf) / SR


def rms_db(x):
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)


def main():
    orig = decode(A("assets", "original-audio.m4a"), 2)
    # Voice chain: match the original narration (high-passed, brighter presence,
    # codec band-limit), denoise the phone recording, gentle compression.
    vchain = ("highpass=f=120:poles=2,highpass=f=110:poles=2,afftdn=nf=-42,"
              "equalizer=f=320:t=q:w=1.1:g=-2.5,equalizer=f=2100:t=q:w=0.9:g=5,"
              "equalizer=f=6500:t=q:w=1.2:g=2,lowpass=f=10000:poles=2,"
              "acompressor=threshold=-26dB:ratio=2.5:attack=6:release=90")
    v1 = decode(A("assets", "voice-intro.m4a"), 1, vchain)[:, 0]
    v2 = decode(A("assets", "voice-2m12.m4a"), 1, vchain)[:, 0]

    # Loudness: original narration ≈ -19.7 dBFS RMS (voice only, during speech).
    target = -19.7
    v1 *= 10 ** ((target - rms_db(sl(v1, 1.1, 11.2))) / 20)
    v2 *= 10 ** ((target - rms_db(sl(v2, 1.9, 18.7))) / 20)
    st = lambda m: np.repeat(m[:, None], 2, axis=1)

    tr = Track()
    # --- Intro: stretch the music-only intro by 3.0 s (orig 0..9.4 then orig 6.0..)
    tr.piece(orig, 0.0, 9.4)
    tr.piece(orig, 6.0, 131.10, xf=0.4)
    D1 = tr.marks[-1][0] - 6.0  # offset for orig >= ~9
    G = 130.25 + D1  # new time where the original narration falls silent

    # --- Gap bed (music pad, chime kept). Voice positions are relative to G.
    tr.piece(orig, 133.9, 138.7)
    PAD = (133.95, 138.6)  # steady music pad, no chime, no voice

    def fill_to(target_dur):
        """Append pad pieces so that tr.dur == target_dur."""
        need = target_dur - tr.dur
        if need <= 0.02:
            return
        maxl = PAD[1] - PAD[0] - XF
        n = int(np.ceil(need / maxl))
        each = need / n + XF
        for _ in range(n):
            tr.piece(orig, PAD[0], PAD[0] + each)

    # chime piece (three notification dings at orig 131.25 / 131.95 / 132.6) starts at G+5.95
    fill_to(G + 5.95 + XF)
    tr.piece(orig, 131.10, 133.90)
    chime_new = tr.marks[-1][0] + (131.25 - 131.10)

    s1 = (1.75, 7.40)    # «ويمكن للمساعد تنبيه الموظف عبر جرس إشعارات على شريط المهام»
    s23 = (7.65, 19.00)  # «يعرض الرسائل… حسب الأولوية» + «مع إبرازها على سطح المكتب لمتابعتها أولًا بأول»
    s1_new = chime_new - 0.20 - (7.25 - s1[0])  # sentence ends ~0.2 s before the first ding
    s23_new = chime_new + 1.40                   # starts with the third ding
    s23_end = s23_new + (18.75 - s23[0])
    resume_new = s23_end + 0.75                  # orig 142.0 lands here (next voice at 142.34)

    tail_piece = (139.95, 142.0)
    fill_to(resume_new - (tail_piece[1] - tail_piece[0]) + XF)
    tr.piece(orig, tail_piece[0], tail_piece[1])
    resume_actual = tr.marks[-1][0] + (tail_piece[1] - tail_piece[0])
    # --- Rest of the narration up to the end-pad, then extend the ending.
    tr.piece(orig, 142.0, 240.2, xf=0.05)
    D2 = tr.marks[-1][0] - 142.0
    tr.piece(orig, 237.6, 240.2, xf=0.3)
    tr.piece(orig, 240.2, 241.92, xf=0.3)
    D3 = tr.marks[-1][0] - 240.2
    mix = tr.buf.copy()
    # final gentle fade
    mix = fade(mix, 0.0, 1.6)
    total = len(mix) / SR

    # --- place the voices
    def place(sig, rec_a, rec_b, new_t):
        nonlocal mix
        seg = fade(sl(sig, rec_a, rec_b)[:, None], 0.04, 0.12)
        x = np.repeat(seg, 2, axis=1)
        i = int(round(new_t * SR))
        end = i + len(x)
        if end > len(mix):
            mix = np.vstack([mix, np.zeros((end - len(mix), 2))])
        mix[i:end] += x

    # intro voice: rec 1.1 s (speech onset) lands at new 2.9 s
    v1_new = 2.9 - (1.1 - 0.95)
    place(v1, 0.95, 11.75, v1_new)
    place(v2, s1[0], s1[1], s1_new)
    place(v2, s23[0], s23[1], s23_new)

    peak = np.abs(mix).max()
    if peak > 0.98:
        mix *= 0.98 / peak
    os.makedirs(A("build"), exist_ok=True)
    with wave.open(A("build", "soundtrack.wav"), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())

    tl = {
        "duration": len(mix) / SR,
        "D1": D1, "G": G, "D2": D2, "D3": D3,
        "resume": resume_actual,
        "chime": chime_new,
        "v1": {"recToNew": v1_new - 0.95},
        "s1": {"start": s1_new, "recA": s1[0]},
        "s23": {"start": s23_new, "recA": s23[0]},
        "marks": tr.marks,
    }
    json.dump(tl, open(A("build", "timeline.json"), "w"), indent=1)
    print(json.dumps({k: v for k, v in tl.items() if k != "marks"}, indent=1))


if __name__ == "__main__":
    main()
