"""Independent speaker similarity (microsoft/wavlm-base-plus-sv x-vectors) vs held-out narrator speech."""
import sys, glob, numpy as np, librosa, torch
from transformers import AutoFeatureExtractor, WavLMForXVector
torch.set_num_threads(4)
STEM = sys.argv[1]; files = sys.argv[2:]
fe = AutoFeatureExtractor.from_pretrained("microsoft/wavlm-base-plus-sv"); mdl = WavLMForXVector.from_pretrained("microsoft/wavlm-base-plus-sv").eval()
def emb(w):
    with torch.no_grad():
        x = fe(w, sampling_rate=16000, return_tensors="pt"); e = mdl(**x).embeddings[0]
    return torch.nn.functional.normalize(e, dim=-1).numpy()
nar = [emb(librosa.load(STEM, sr=16000, offset=s, duration=e - s)[0]) for s, e in [(62.3, 76.8), (142.4, 158.2), (198.2, 208.0), (215, 223)]]
sim = lambda e: float(np.mean([e @ r for r in nar]))
for s, d in [(41.7, 8.8), (14.0, 5.4), (172.3, 9), (88.7, 9), (120.2, 8)]:
    print(f"narrator self {s:6.1f}  {sim(emb(librosa.load(STEM, sr=16000, offset=s, duration=d)[0])):.3f}")
for f in files:
    print(f"{f.split('/')[-1]:28s} {sim(emb(librosa.load(f, sr=16000)[0])):.3f}", flush=True)
