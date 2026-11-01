"""Speaker similarity of takes to held-out narrator speech (Chatterbox voice encoder); optional VC versions."""
import sys, json, glob, os, numpy as np, librosa, torch, torchaudio
torch.set_num_threads(4)
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
D, STEM = sys.argv[1], sys.argv[2]; VC_REF = sys.argv[3] if len(sys.argv) > 3 else None
m = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
E = lambda w: m.ve.embeds_from_wavs([w], sample_rate=16000)[0]
nar = [E(librosa.load(STEM, sr=16000, offset=s, duration=e - s)[0]) for s, e in [(62.3, 76.8), (142.4, 158.2), (198.2, 208.0), (215, 223)]]
sim = lambda e: float(np.mean([np.dot(e, r) / np.linalg.norm(e) / np.linalg.norm(r) for r in nar]))
vc = None
if VC_REF:
    from chatterbox.vc import ChatterboxVC; vc = ChatterboxVC.from_pretrained(device="cpu")
meta = json.load(open(f"{D}/f5.json")); out = []
for g in meta:
    p = f"{D}/{g['name']}.wav"; g["spk"] = sim(E(librosa.load(p, sr=16000)[0]))
    if vc:
        y = vc.generate(p, target_voice_path=VC_REF); torchaudio.save(p.replace(".wav", "_vc.wav"), y, vc.sr)
        g["spk_vc"] = sim(E(librosa.load(p.replace(".wav", "_vc.wav"), sr=16000)[0]))
    else: g["spk_vc"] = -1
    out.append(g); print(g["name"], "spk", round(g["spk"], 3), "vc", round(g["spk_vc"], 3), flush=True)
json.dump(out, open(f"{D}/gen.json", "w"), indent=1)
