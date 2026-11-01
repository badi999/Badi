"""Split the original soundtrack into narration (vocals) and music with torchaudio HDemucs.
Writes build/narration-vocals.wav (stereo, 44.1 kHz). Chunked with overlap-add for memory."""
import sys, torch, torchaudio
from torchaudio.pipelines import HDEMUCS_HIGH_MUSDB_PLUS as B
torch.set_num_threads(4)
src, dst = sys.argv[1], sys.argv[2]
model = B.get_model().eval(); sr = B.sample_rate
wav, fs = torchaudio.load(src)
if fs != sr: wav = torchaudio.functional.resample(wav, fs, sr)
if wav.shape[0] == 1: wav = wav.repeat(2, 1)
L = wav.shape[1]; seg, ov = 30 * sr, 2 * sr
out = torch.zeros_like(wav); wsum = torch.zeros(L)
i = 0
while i < L:
    a, b = i, min(L, i + seg)
    x = wav[:, a:b]; ref = x.mean(0); m, s = ref.mean(), ref.std() + 1e-8
    with torch.no_grad():
        y = model(((x - m) / s)[None])[0] * s + m
    v = y[model.sources.index("vocals")]
    n = b - a; w = torch.ones(n)
    if a > 0: w[:ov] = torch.linspace(0, 1, ov)
    if b < L: w[-ov:] = torch.linspace(1, 0, ov)
    out[:, a:b] += v * w; wsum[a:b] += w
    print(f"chunk {a / sr:.0f}-{b / sr:.0f}s", flush=True)
    if b == L: break
    i = b - ov
out = out / wsum.clamp(min=1e-6)
torchaudio.save(dst, out, sr)
