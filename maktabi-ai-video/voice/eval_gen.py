import json, sys, re, numpy as np, wave, glob, os
import scipy.signal as ss
from faster_whisper import WhisperModel
from faster_whisper.tokenizer import Tokenizer
from faster_whisper.transcribe import get_ctranslate2_storage
MP, D = sys.argv[1], sys.argv[2]
REF = {"A": "في ظل الثورة الرقمية للذكاء الاصطناعي",
       "BC": "نقدم لكم عرضا مقترحا في مجال الذكاء الاصطناعي لوزارة الأوقاف والشؤون الدينية",
       "S1": "ويمكن للمساعد تنبيه الموظف عبر جرس إشعارات على شريط المهام",
       "S2": "يعرض الرسائل والمعاملات التي تحتاج إلى إجراء مرتبة حسب الأولوية",
       "S3": "مع إبرازها على سطح المكتب لمتابعتها أولا بأول"}
def norm(s):
    s = re.sub(r'[ً-ْٰـ]', '', s)
    s = re.sub('[أإآ]', 'ا', s).replace('ى', 'ي').replace('ة', 'ه').replace('ؤ', 'و').replace('ئ', 'ي')
    s = re.sub(r'[^؀-ۿ\s]', ' ', s)
    return s.split()
def wer(h, r):
    d = np.arange(len(r) + 1)
    for i, hw in enumerate(h, 1):
        prev, d[0] = d.copy(), i
        for j, rw in enumerate(r, 1):
            d[j] = min(prev[j] + 1, d[j - 1] + 1, prev[j - 1] + (hw != rw))
    return d[-1] / max(1, len(r))
m = WhisperModel(MP, device="cpu", compute_type="int8", cpu_threads=4)
tok = Tokenizer(m.hf_tokenizer, True, task="transcribe", language="ar")
gen = json.load(open(f"{D}/gen.json"))
for g in gen:
    w = wave.open(f"{D}/{g['name']}.wav"); sr = w.getframerate()
    a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    a16 = ss.resample_poly(a, 16000, sr).astype(np.float32) if sr != 16000 else a
    segs, _ = m.transcribe(a16, language="ar", beam_size=5, word_timestamps=True)
    segs = list(segs)
    hyp = " ".join(s.text for s in segs).strip()
    words = [(x.word.strip(), x.start, x.end) for s in segs for x in (s.words or [])]
    feat = m.feature_extractor(a16); nf = feat.shape[-1]
    pad = np.zeros((feat.shape[0], 3000), np.float32); pad[:, :min(nf, 3000)] = feat[:, :3000]
    enc = m.model.encode(get_ctranslate2_storage(pad[None]))
    tt = tok.encode(" " + REF[g["key"]])
    probs = np.array(m.model.align(enc, tok.sot_sequence, [tt], min(nf, 3000))[0].text_token_probs)
    g.update(hyp=hyp, wer=round(float(wer(norm(hyp), norm(REF[g["key"]]))), 3), pmean=round(float(probs.mean()), 3), words=words)
    print(f"{g['name']:14s} dur {g['dur']:5.2f} spk {g['spk']:.3f} wer {g['wer']:.2f} p {g['pmean']:.2f} | {hyp}", flush=True)
json.dump(gen, open(f"{D}/eval.json", "w"), ensure_ascii=False, indent=1)
