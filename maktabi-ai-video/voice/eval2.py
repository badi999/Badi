import json, sys, re, numpy as np, wave
import scipy.signal as ss
from faster_whisper import WhisperModel
D = sys.argv[1]
def norm(s):
    s = re.sub(r'[ً-ْٰـ]', '', s)
    s = re.sub('[أإآ]', 'ا', s).replace('ى', 'ي').replace('ة', 'ه').replace('ؤ', 'و').replace('ئ', 'ي')
    return re.sub(r'[^؀-ۿ\s]', ' ', s).split()
REF = {"A": "في ظل الثورة الرقمية للذكاء الاصطناعي", "BC": "نقدم لكم عرضا مقترحا في مجال الذكاء الاصطناعي لوزارة الأوقاف والشؤون الدينية",
       "S1": "ويمكن للمساعد تنبيه الموظف عبر جرس إشعارات على شريط المهام", "S2": "يعرض الرسائل والمعاملات التي تحتاج إلى إجراء مرتبة حسب الأولوية",
       "S3": "مع إبرازها على سطح المكتب لمتابعتها أولا بأول"}
def wer(h, r):
    d = np.arange(len(r) + 1)
    for i, hw in enumerate(h, 1):
        prev, d[0] = d.copy(), i
        for j, rw in enumerate(r, 1): d[j] = min(prev[j] + 1, d[j - 1] + 1, prev[j - 1] + (hw != rw))
    return d[-1] / max(1, len(r))
m = WhisperModel("large-v3-turbo", device="cpu", compute_type="int8", cpu_threads=4)
ev = json.load(open(f"{D}/eval.json"))
for g in ev:
    w = wave.open(f"{D}/{g['name']}.wav"); sr = w.getframerate()
    a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    a16 = ss.resample_poly(a, 16000, sr).astype(np.float32)
    segs, _ = m.transcribe(a16, language="ar", beam_size=5)
    hyp = " ".join(s.text for s in segs).strip()
    g["hyp2"] = hyp; g["wer2"] = round(float(wer(norm(hyp), norm(REF[g["key"]]))), 3)
    print(f"{g['name']:12s} wer2 {g['wer2']:.2f} spk {g['spk']:.3f} | {hyp}", flush=True)
json.dump(ev, open(f"{D}/eval.json", "w"), ensure_ascii=False, indent=1)
