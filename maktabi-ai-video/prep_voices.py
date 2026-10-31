#!/usr/bin/env python3
"""Match the recorded voices to the original narrator (pitch median/range + slight formant shift).
Needs: pip install praat-parselmouth numpy. Writes build/voice-intro-conv.wav and build/voice-2m12-conv.wav.
Original narrator: F0 median ~118 Hz (p10 91 / p90 164); recordings: ~98 Hz, narrow range."""
import os, subprocess, tempfile
import parselmouth
from parselmouth.praat import call
HERE = os.path.dirname(os.path.abspath(__file__))
for name in ("voice-intro", "voice-2m12"):
    with tempfile.TemporaryDirectory() as td:
        wav = os.path.join(td, "src.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(HERE, "assets", name + ".m4a"), "-ac", "1", "-ar", "44100", wav], check=True)
        snd = parselmouth.Sound(wav)
        # pitch floor, ceiling, formant shift ratio, new pitch median, pitch range factor, duration factor
        out = call(snd, "Change gender", 70, 300, 1.05, 117, 1.7, 1.0)
        out.save(os.path.join(HERE, "build", name + "-conv.wav"), "WAV")
        print("wrote", name + "-conv.wav")
