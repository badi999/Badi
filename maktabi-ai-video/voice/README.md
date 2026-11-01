# Narration for the intro and the ~2:12 section

Generated in the original narrator's voice so the whole video has one voice and reads exactly the written text.

1. `separate.py` — isolates the narrator's voice from the music (torchaudio HDemucs) to get a clean reference.
2. `gen_all.py` — Chatterbox Multilingual TTS (`language_id="ar"`), cloning the narrator from the reference;
   two text variants (plain / fully voweled) × two seeds per sentence, with speaker-similarity scores.
3. `eval_gen.py`, `eval2.py` — speech-recognition check of every take against the written text
   (Whisper small + Whisper large-v3-turbo).
4. `select.py` — keeps the take with zero recognition errors and the highest similarity to the narrator,
   trims it into `assets/voice-gen/`, and writes `build/voices.json` (used by `build_audio.py`).
