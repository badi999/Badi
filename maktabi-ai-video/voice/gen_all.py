import sys, time, json, torch, torchaudio, numpy as np, librosa
torch.set_num_threads(4)
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
ref, outdir = sys.argv[1], sys.argv[2]
T = {
 "A":  ["في ظل الثورة الرقمية للذكاء الاصطناعي،", "في ظِلِّ الثَّورةِ الرَّقميَّةِ للذَّكاءِ الاصطناعيِّ،"],
 "BC": ["نقدم لكم عرضًا مقترحًا في مجال الذكاء الاصطناعي لوزارة الأوقاف والشؤون الدينية.", "نُقدِّمُ لكم عرضًا مُقترَحًا في مجالِ الذَّكاءِ الاصطناعيِّ لوزارةِ الأوقافِ والشُّؤونِ الدِّينيَّة."],
 "S1": ["ويمكن للمساعد تنبيه الموظف عبر جرس إشعارات على شريط المهام.", "ويُمكنُ للمُساعِدِ تنبيهُ المُوظَّفِ عبرَ جرسِ إشعاراتٍ على شريطِ المهامّ."],
 "S2": ["يعرض الرسائل والمعاملات التي تحتاج إلى إجراء مرتبةً حسب الأولوية،", "يَعرِضُ الرَّسائلَ والمُعاملاتِ التي تحتاجُ إلى إجراءٍ مُرتَّبةً حسبَ الأولويَّة،"],
 "S3": ["مع إبرازها على سطح المكتب لمتابعتها أولًا بأول.", "مع إبرازِها على سطحِ المكتبِ لمُتابعتِها أوَّلًا بأوَّل."],
}
m = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
def emb(path):
    w, sr = librosa.load(path, sr=16000)
    return m.ve.embeds_from_wavs([w], sample_rate=16000)[0]
nar = [emb(f"{outdir}/../voc_{i}.wav") for i in (0, 2, 3)]
usr = emb(sys.argv[3])
res = []
def sim(e, refs): return float(np.mean([np.dot(e, r) / np.linalg.norm(e) / np.linalg.norm(r) for r in refs]))
print("baseline user-recording vs narrator sim:", round(sim(usr, nar), 3), flush=True)
for key, variants in T.items():
    for vi, text in enumerate(variants):
        for seed in (11, 23):
            torch.manual_seed(seed)
            t1 = time.time()
            wav = m.generate(text, language_id="ar", audio_prompt_path=ref, exaggeration=0.5, cfg_weight=0.5, temperature=0.7)
            name = f"{key}_v{vi}_s{seed}"
            path = f"{outdir}/{name}.wav"
            torchaudio.save(path, wav, m.sr)
            s = sim(emb(path), nar)
            res.append({"name": name, "key": key, "variant": vi, "seed": seed, "dur": wav.shape[-1] / m.sr, "spk": s})
            print(name, "dur", round(wav.shape[-1] / m.sr, 2), "spk", round(s, 3), "gen", round(time.time() - t1, 1), flush=True)
            json.dump(res, open(f"{outdir}/gen.json", "w"), indent=1)
