import json, sys, re, wave, numpy as np, os
D, P = sys.argv[1], sys.argv[2]
ev = json.load(open(f"{D}/eval.json"))
best = {}
for g in ev:
    k = g["key"]
    score = (g["wer2"], -g["spk"], -g["pmean"])
    if k not in best or score < best[k][0]: best[k] = (score, g)
os.makedirs(f"{P}/assets/voice-gen", exist_ok=True)
def norm(s):
    s = re.sub(r'[ً-ْٰـ]', '', s); s = re.sub('[أإآ]', 'ا', s)
    return s.replace('ة', 'ه').strip(' ،,.')
out = {"intro": [], "gap": [], "intro_pauses": [0.5]}
for k in ["A", "BC", "S1", "S2", "S3"]:
    g = best[k][1]
    w = wave.open(f"{D}/{g['name']}.wav"); sr = w.getframerate()
    a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    env = np.convolve(np.abs(a), np.ones(sr // 100) / (sr // 100), mode="same")
    idx = np.where(env > max(env.max() * 0.04, 1e-4))[0]
    i0, i1 = max(0, idx[0] - int(.04 * sr)), min(len(a), idx[-1] + int(.08 * sr))
    t = a[i0:i1]
    t[:int(.01 * sr)] *= np.linspace(0, 1, int(.01 * sr)); t[-int(.03 * sr):] *= np.linspace(1, 0, int(.03 * sr))
    fn = f"assets/voice-gen/{k}.wav"
    with wave.open(f"{P}/{fn}", "wb") as o:
        o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr); o.writeframes((t * 32767).astype(np.int16).tobytes())
    off = i0 / sr; dur = len(t) / sr
    entry = {"file": fn, "trimmed": True, "src": g["name"], "wer": g["wer2"], "asr": g["hyp2"], "p": g["pmean"], "spk": round(g["spk"], 3), "hyp": g["hyp"]}
    ws = [(norm(x[0]), x[1] - off, x[2] - off) for x in g["words"]]
    if k == "BC":
        m = [x for x in ws if x[0].startswith("لوزار") or x[0].startswith("وزار")]
        entry["split"] = round(max(0.5, m[0][1] - 0.05), 3) if m else round(dur * 0.62, 3)
    if k == "S2":
        m = [x for x in ws if x[0].startswith("مرتب")]
        out["sort_word"] = round((m[0][1] if m else dur * 0.62) / dur, 3)
    (out["intro"] if k in ("A", "BC") else out["gap"]).append(entry)
    print(k, g["name"], f"dur {dur:.2f}", "wer", g["wer"], "p", g["pmean"], "spk", round(g["spk"], 3), "|", g["hyp"])
json.dump(out, open(f"{P}/build/voices.json", "w"), ensure_ascii=False, indent=1)
print(json.dumps({k: v for k, v in out.items() if k not in ('intro', 'gap')}), [e.get("split") for e in out["intro"]])
