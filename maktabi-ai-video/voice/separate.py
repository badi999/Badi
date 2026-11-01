import torch, torchaudio, sys
from torchaudio.pipelines import HDEMUCS_HIGH_MUSDB_PLUS as B
torch.set_num_threads(4)
src, outdir = sys.argv[1], sys.argv[2]
model = B.get_model().eval(); sr = B.sample_rate
wav, fs = torchaudio.load(src)
if fs != sr: wav = torchaudio.functional.resample(wav, fs, sr)
segs = [(14.0, 33.6), (41.6, 62.2), (62.2, 85.7), (172.2, 194.0)]
for i, (a, b) in enumerate(segs):
    x = wav[:, int(a * sr):int(b * sr)]
    ref = x.mean(0); m, s = ref.mean(), ref.std()
    with torch.no_grad():
        y = model(((x - m) / s)[None])[0] * s + m
    voc = y[B.sources.index("vocals") if hasattr(B, "sources") else model.sources.index("vocals")]
    torchaudio.save(f"{outdir}/voc_{i}.wav", voc.mean(0, keepdim=True), sr)
    print("sep", i, a, b, flush=True)
