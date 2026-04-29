#!/usr/bin/env python3
"""
Run this script locally (not in Claude Code) to generate VO audio files.
Requires: pip install requests
Usage:    python3 generate-vo.py
Output:   uploads/vo1.mp3 … vo8.mp3
"""
import os, requests, time

API_KEY  = "sk_7d24c5891fb1644c403c46d442d51bd55a5569a64eb675a1"
# Josh — deep, warm American male (good southern proxy)
VOICE_ID = "TxGEqnHWrfWFTfGW9XjX"

LINES = [
    (1, "In the south, the path to homeownership"),
    (2, "isn't just a transaction. It's a milestone years in the making."),
    (3, "At Southern Trust Lending, we understand that."),
    (4, "We walk the path with you, from first conversation to closing day and beyond."),
    (5, "Rooted in Baton Rouge, licensed across the south."),
    (6, "Built on relationships that outlast the loan."),
    (7, "This is what lending should look like."),
    (8, "Where your home journey begins."),
]

os.makedirs("uploads", exist_ok=True)

for idx, text in LINES:
    out = f"uploads/vo{idx}.mp3"
    print(f"Generating {out} …")
    resp = requests.post(
        f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}",
        headers={"xi-api-key": API_KEY, "Content-Type": "application/json"},
        json={
            "text": text,
            "model_id": "eleven_turbo_v2",
            "voice_settings": {
                "stability": 0.55,
                "similarity_boost": 0.80,
                "style": 0.20,           # slight warmth/expressiveness
                "use_speaker_boost": True
            }
        },
        timeout=30,
    )
    if resp.status_code == 200:
        with open(out, "wb") as f:
            f.write(resp.content)
        print(f"  ✓  {out}  ({len(resp.content)//1024}KB)")
    else:
        print(f"  ✗  Error {resp.status_code}: {resp.text}")
    time.sleep(0.5)   # stay within rate limits

print("\nDone. Add the uploads/vo*.mp3 files to your repo and reload the promo.")
