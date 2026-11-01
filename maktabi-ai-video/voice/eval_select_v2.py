"""Score every take (plain TTS and VC version): exact reading (Whisper large-v3-turbo), similarity to the
narrator, pitch and speaking pace vs the narrator; keep the best take per sentence -> assets/voice-gen/."""
import json, sys, re, wave, os, numpy as np, scipy.signal as ss, parselmouth
from faster_whisper import WhisperModel
D, P, STEM = sys.argv[1], sys.argv[2], sys.argv[3]
REF = {"A": "في ظل الثورة الرقمية للذكاء الاصطناعي", "BC": "نقدم لكم عرضا مقترحا في مجال الذكاء الاصطناعي لوزارة الأوقاف والشؤون الدينية",
       "S1": "ويمكن للمساعد تنبيه الموظف عبر جرس إشعارات على شريط المهام", "S2": "يعرض الرسائل والمعاملات التي تحتاج إلى إجراء مرتبة حسب الأولوية",
       "S3": "مع إبرازها على سطح المكتب لمتابعتها أولا بأول"}
def norm(s):
    s = re.sub(r'[ً-ْٰـ]', '', s)
    s = re.sub('[أإآ]', 'ا', s).replace('ى', 'ي').replace('ة', 'ه').replace('ؤ', 'و').replace('ئ', 'ي')
    return re.sub(r'[^؀-ۿ\s]', ' ', s).split()
def wer(h, r):
    d = np.arange(len(r) + 1)
    for i, hw in enumerate(h, 1):
        prev, d[0] = d.copy(), i
        for j, rw in enumerate(r, 1): d[j] = min(prev[j] + 1, d[j - 1] + 1, prev[j - 1] + (hw != rw))
    return d[-1] / max(1, len(r))
def load(p):
    w = wave.open(p); sr = w.getframerate(); n = w.getnchannels()
    a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32).reshape(-1, n).mean(1) / 32768
    return a, sr
def trim(a, sr):
    env = np.convolve(np.abs(a), np.ones(sr // 100) / (sr // 100), mode="same")
    idx = np.where(env > max(env.max() * 0.04, 1e-4))[0]
    return a[max(0, idx[0] - int(.04 * sr)):min(len(a), idx[-1] + int(.08 * sr))]
def f0(a, sr):
    p = parselmouth.Sound(a.astype(np.float64), sr).to_pitch(time_step=0.01, pitch_floor=60, pitch_ceiling=400).selected_array['frequency']
    p = p[p > 0]; return float(np.median(p)), float(np.percentile(p, 90) / max(np.percentile(p, 10), 1))
# narrator reference: pitch + pace (characters per second of speech) from the separated narration
st, ssr = load(STEM)
nf0 = f0(st[int(14 * ssr):int(130 * ssr)], ssr)
pace_n = []
for txt, s, e in [("بوصفها مقترحا لمساعد ذكي يعمل ضمن بيئة العمل الحكومية", 13.95, 19.4), ("تقوم الفكرة على إضافة مساعد ذكي داخل نظام مكتبي", 41.7, 45.6),
                  ("لذلك يجب أن يخضع أي تكامل لموافقة الجهات المختصة بالوزارة", 145.9, 150.6), ("ولضمان تنفيذ مدروس", 172.3, 173.9)]:
    seg = trim(st[int(s * ssr):int(e * ssr)], ssr); pace_n.append(len("".join(norm(txt))) / (len(seg) / ssr))
pace_n = float(np.median(pace_n))
print(f"narrator: F0 median {nf0[0]:.1f} Hz, range ratio {nf0[1]:.2f}, pace {pace_n:.1f} chars/s", flush=True)
m = WhisperModel("large-v3-turbo", device="cpu", compute_type="int8", cpu_threads=4)
gen = json.load(open(f"{D}/gen.json")); cands = []
for g in gen:
    for vc in (False, True):
        name = g["name"] + ("_vc" if vc else "")
        a, sr = load(f"{D}/{name}.wav"); a = trim(a, sr)
        a16 = ss.resample_poly(a, 16000, sr).astype(np.float32)
        hyp = " ".join(s.text for s in m.transcribe(a16, language="ar", beam_size=5)[0]).strip()
        w = float(wer(norm(hyp), norm(REF[g["key"]])))
        fm, fr = f0(a, sr); pace = len("".join(norm(REF[g["key"]]))) / (len(a) / sr)
        c = {"name": name, "key": g["key"], "wer": w, "spk": g["spk_vc" if vc else "spk"], "f0": fm, "f0r": fr, "pace": pace, "hyp": hyp, "dur": len(a) / sr}
        # penalties: pitch off by %, pace off by %
        c["score"] = c["spk"] - 0.6 * abs(fm / nf0[0] - 1) - 0.4 * abs(pace / pace_n - 1)
        cands.append(c)
        print(f"{name:16s} wer {w:.2f} spk {c['spk']:.3f} f0 {fm:5.1f} pace {pace:4.1f} score {c['score']:.3f} | {hyp}", flush=True)
json.dump({"narrator": {"f0": nf0, "pace": pace_n}, "cands": cands}, open(f"{D}/eval_v2.json", "w"), ensure_ascii=False, indent=1)
os.makedirs(f"{P}/assets/voice-gen", exist_ok=True)
out = {"intro": [], "gap": [], "intro_pauses": [0.5]}
for k in ["A", "BC", "S1", "S2", "S3"]:
    cs = sorted([c for c in cands if c["key"] == k], key=lambda c: (c["wer"] > 0, -c["score"]))
    b = cs[0]
    a, sr = load(f"{D}/{b['name']}.wav"); a = trim(a, sr)
    a[:int(.01 * sr)] *= np.linspace(0, 1, int(.01 * sr)); a[-int(.03 * sr):] *= np.linspace(1, 0, int(.03 * sr))
    fn = f"assets/voice-gen/{k}.wav"
    with wave.open(f"{P}/{fn}", "wb") as o:
        o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr); o.writeframes((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes())
    e = {"file": fn, "trimmed": True, "src": b["name"], "wer": b["wer"], "spk": round(b["spk"], 3), "f0": round(b["f0"], 1), "pace": round(b["pace"], 1), "asr": b["hyp"]}
    if k in ("BC", "S2"):
        a16 = ss.resample_poly(a, 16000, sr).astype(np.float32)
        ws = [(norm(x.word)[0] if norm(x.word) else "", x.start) for s in m.transcribe(a16, language="ar", word_timestamps=True)[0] for x in s.words]
        key = ("لوزار", "وزار") if k == "BC" else ("مرتب",)
        hit = [t for wd, t in ws if wd.startswith(key)]
        if k == "BC": e["split"] = round(max(.5, (hit[0] if hit else len(a) / sr * .6) - .05), 3)
        else: out["sort_word"] = round((hit[0] if hit else len(a) / sr * .62) / (len(a) / sr), 3)
    (out["intro"] if k in ("A", "BC") else out["gap"]).append(e)
    print("SELECTED", k, b["name"], f"wer {b['wer']:.2f} spk {b['spk']:.3f} f0 {b['f0']:.1f} pace {b['pace']:.1f}", "|", b["hyp"], flush=True)
json.dump(out, open(f"{P}/build/voices.json", "w"), ensure_ascii=False, indent=1)
