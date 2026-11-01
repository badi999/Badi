"""Second pass: clone from the music-free narration stem, 6 takes per sentence, then a voice-conversion
pass onto the same reference. Scores speaker similarity against held-out narrator speech."""
import sys, json, time, torch, torchaudio, numpy as np, librosa
torch.set_num_threads(4)
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
from chatterbox.vc import ChatterboxVC
REF, STEM, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
T = {
 "A":  ["في ظل الثورة الرقمية للذكاء الاصطناعي،", "في ظِلِّ الثَّورةِ الرَّقميَّةِ للذَّكاءِ الاصطناعيِّ،"],
 "BC": ["نقدم لكم عرضًا مقترحًا في مجال الذكاء الاصطناعي لوزارة الأوقاف والشؤون الدينية.", "نُقدِّمُ لكم عرضًا مُقترَحًا في مجالِ الذَّكاءِ الاصطناعيِّ لوزارةِ الأوقافِ والشُّؤونِ الدِّينيَّة."],
 "S1": ["ويمكن للمساعد تنبيه الموظف عبر جرس إشعارات على شريط المهام.", "ويُمكنُ للمُساعِدِ تنبيهُ المُوظَّفِ عبرَ جرسِ إشعاراتٍ على شريطِ المهامّ."],
 "S2": ["يعرض الرسائل والمعاملات التي تحتاج إلى إجراء مرتبةً حسب الأولوية،", "يَعرِضُ الرَّسائلَ والمُعاملاتِ التي تحتاجُ إلى إجراءٍ مُرتَّبةً حسبَ الأولويَّة،"],
 "S3": ["مع إبرازها على سطح المكتب لمتابعتها أولًا بأول.", "مع إبرازِها على سطحِ المكتبِ لمُتابعتِها أوَّلًا بأوَّل."],
}
m = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
vc = ChatterboxVC.from_pretrained(device="cpu")
def emb_wav(w): return m.ve.embeds_from_wavs([w], sample_rate=16000)[0]
nar = [emb_wav(librosa.load(STEM, sr=16000, offset=s, duration=e - s)[0]) for s, e in [(62.3, 76.8), (142.4, 158.2), (198.2, 208.0), (215, 223)]]
sim = lambda e: float(np.mean([np.dot(e, r) / np.linalg.norm(e) / np.linalg.norm(r) for r in nar]))
self_ref = [sim(emb_wav(librosa.load(STEM, sr=16000, offset=s, duration=d)[0])) for s, d in [(41.7, 9), (14.0, 9), (172.3, 9), (88.7, 9)]]
print("narrator self-similarity (ceiling):", [round(x, 3) for x in self_ref], flush=True)
res = []
for key, variants in T.items():
    for vi, text in enumerate(variants):
        for seed in (5, 17, 29):
            torch.manual_seed(seed); t = time.time()
            wav = m.generate(text, language_id="ar", audio_prompt_path=REF, exaggeration=0.5, cfg_weight=0.5, temperature=0.7)
            name = f"{key}_v{vi}_s{seed}"; p = f"{OUT}/{name}.wav"; torchaudio.save(p, wav, m.sr)
            out = vc.generate(p, target_voice_path=REF); pv = f"{OUT}/{name}_vc.wav"; torchaudio.save(pv, out, vc.sr)
            s0 = sim(emb_wav(librosa.load(p, sr=16000)[0])); s1 = sim(emb_wav(librosa.load(pv, sr=16000)[0]))
            res.append({"name": name, "key": key, "variant": vi, "seed": seed, "spk": s0, "spk_vc": s1})
            print(name, "spk", round(s0, 3), "vc", round(s1, 3), "gen", round(time.time() - t), flush=True)
            json.dump(res, open(f"{OUT}/gen.json", "w"), indent=1)
