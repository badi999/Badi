"""Build listening-comparison files: a real sentence of the narrator, then the five new sentences of one version,
processed exactly as in the video (EQ-matched to the narrator, same loudness)."""
import sys, os, json, subprocess, numpy as np
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import build_audio as B
out, files = sys.argv[1], sys.argv[2:]
narr = B.decode(B.A("build", "narration-vocals.wav"), 1)[:, 0]
ref = np.concatenate([B.sl(narr, a, b) for a, b in [(14, 41), (41.7, 62), (62.3, 85.6), (142.4, 190)]])
clips = [B.load_clip(f, "highpass=f=110:poles=2,lowpass=f=11000:poles=2,acompressor=threshold=-24dB:ratio=2:attack=6:release=90") for f in files]
clips = B.eq_match(clips, ref)
tgt = B.rms_db(B.sl(narr, 17, 40))
sample = B.sl(narr, 41.65, 50.5)  # «تقوم الفكرة على إضافة مساعد ذكي ...» — the narrator himself
gap = lambda s: np.zeros(int(s * B.SR))
parts = [sample, gap(1.6)]
for i, c in enumerate(clips):
    c = c * 10 ** ((tgt - B.rms_db(c)) / 20)
    parts += [c, gap(1.2 if i in (1,) else 0.45)]
y = np.concatenate(parts); y = y / max(1, np.abs(y).max() / 0.89)
raw = (np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes()
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(B.SR), "-ac", "1", "-i", "-", "-c:a", "libmp3lame", "-b:a", "192k", out], input=raw, check=True)
print("wrote", out, round(len(y) / B.SR, 1), "s")
