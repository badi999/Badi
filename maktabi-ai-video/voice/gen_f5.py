"""Clone the narrator with an Arabic F5-TTS checkpoint (IbrahimSalah/Arabic-F5-TTS-v2): the reference is a sentence
of the narrator himself with its exact fully-voweled transcript, so the model continues his voice, rhythm and accent."""
import sys, json, time, torch, torchaudio, soundfile as sf
from huggingface_hub import hf_hub_download as hub
from f5_tts.model import DiT
from f5_tts.infer.utils_infer import load_model, load_vocoder, infer_process, preprocess_ref_audio_text
torch.set_num_threads(4)
OUT = sys.argv[1]; ONLY = sys.argv[2].split(",") if len(sys.argv) > 2 else None
USE_REFS = sys.argv[3].split(",") if len(sys.argv) > 3 else None; SEEDS = tuple(int(x) for x in sys.argv[4].split(",")) if len(sys.argv) > 4 else (3, 11, 27)
REFS = {
 "refA": ("refA.wav", "تَقُومُ الْفِكْرَةُ عَلَى إِضَافَةِ مُسَاعِدٍ ذَكِيٍّ دَاخِلَ نِظَامِ مَكْتَبِي، يُمْكِنُ الْوُصُولُ إِلَيْهِ مِنْ خِلَالِ زِرٍّ وَاضِحٍ فِي وَاجِهَةِ النِّظَامِ."),
 "refB": ("refB.wav", "وَهُنَا يُمْكِنُ لِلذَّكَاءِ الاصْطِنَاعِيِّ أَنْ يُقَدِّمَ دَعْمًا عَمَلِيًّا لِلْمُوَظَّفِ، مَعَ بَقَاءِ الْقَرَارِ النِّهَائِيِّ بِيَدِ الْإِنْسَانِ."),
}
T = {
 "A":  "فِي ظِلِّ الثَّوْرَةِ الرَّقْمِيَّةِ لِلذَّكَاءِ الاصْطِنَاعِيِّ،",
 "BC": "نُقَدِّمُ لَكُمْ عَرْضًا مُقْتَرَحًا فِي مَجَالِ الذَّكَاءِ الاصْطِنَاعِيِّ لِوِزَارَةِ الْأَوْقَافِ وَالشُّؤُونِ الدِّينِيَّةِ.",
 "S1": "وَيُمْكِنُ لِلْمُسَاعِدِ تَنْبِيهُ الْمُوَظَّفِ عَبْرَ جَرَسِ إِشْعَارَاتٍ عَلَى شَرِيطِ الْمَهَامِّ،",
 "S2": "يَعْرِضُ الرَّسَائِلَ وَالْمُعَامَلَاتِ الَّتِي تَحْتَاجُ إِلَى إِجْرَاءٍ مُنَظَّمَةً حَسَبَ الْأَوْلَوِيَّةِ،",
 "S3": "مَعَ إِبْرَازِهَا عَلَى سَطْحِ الْمَكْتَبِ لِمُتَابَعَتِهَا أَوَّلًا بِأَوَّلٍ.",
}
R = "IbrahimSalah/Arabic-F5-TTS-v2"
vocab = hub(R, "vocab.txt"); ckpt = hub(R, "model_547500_8_18.pt")
voc_chars = set(l.rstrip("\n") for l in open(vocab, encoding="utf-8"))
missing = {c for s in list(T.values()) + [r[1] for r in REFS.values()] for c in s if c not in voc_chars}
print("chars not in vocab:", missing, flush=True)
arch = dict(dim=1024, depth=22, heads=18, ff_mult=2, text_dim=512, text_mask_padding=False, conv_layers=8, pe_attn_head=1)
model = load_model(DiT, arch, ckpt, mel_spec_type="vocos", vocab_file=vocab, device="cpu", use_ema=True)
vocoder = load_vocoder("vocos", device="cpu")
res = []
for rk, (rfile, rtext) in REFS.items():
    if USE_REFS and rk not in USE_REFS: continue
    ra, rt = preprocess_ref_audio_text(rfile, rtext)
    for key, text in T.items():
        if ONLY and key not in ONLY: continue
        for seed in SEEDS:
            torch.manual_seed(seed); t = time.time()
            wav, sr, _ = infer_process(ra, rt, text, model, vocoder, mel_spec_type="vocos", nfe_step=32, cfg_strength=2.0, speed=1.0, device="cpu", show_info=lambda *a: None)
            name = f"{key}_{rk}_s{seed}"; sf.write(f"{OUT}/{name}.wav", wav, sr)
            res.append({"name": name, "key": key, "ref": rk, "seed": seed, "dur": len(wav) / sr})
            print(name, "dur", round(len(wav) / sr, 2), "gen", round(time.time() - t), flush=True)
            json.dump(res, open(f"{OUT}/f5_{ONLY and '-'.join(ONLY)}.json", "w"), indent=1)
