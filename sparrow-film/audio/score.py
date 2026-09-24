"""Sparrow film score — a nervous system coming online.

D major / B minor. Sparse at first, more voices as context gathers,
a held breath before the brand, then a Dmaj9 resolve.

Deterministic. Re-run:  python audio/score.py
"""
import shutil, subprocess, wave
import numpy as np

def ffmpeg_bin():
    found = shutil.which('ffmpeg') or shutil.which('ffmpeg.exe')
    if found:
        return found
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return None

SR = 48000
DUR = 66.0
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(11)

# Scene-absolute cues (from src/motion/timing.ts)
PROBLEM_H1, PROBLEM_H2 = 3.70, 4.45
MEETING = 6.00
HIGHLIGHTS = (8.10, 8.50, 8.90)
EXTRACT = 12.00
RESOLVES = (14.20, 14.55)
CLICK, EXPAND, PLAY = 19.80, 19.95, 20.80
ROWS = (27.75, 28.30, 28.85, 29.40)
PRIVACY, LAND, CONNECT = 33.90, 35.80, 36.55
Q1, A1, Q2, A2, Q3 = 40.35, 41.65, 44.20, 45.25, 47.15
NETWORK, NET_PULSE = 53.00, 55.15
BRAND = 58.00
PHRASES = (59.30, 60.15, 61.00)
SILENCE, LOCKUP, HERO, CTA = 61.75, 62.25, 62.85, 63.85

hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)

def env(points):
    xs, ys = zip(*points)
    return np.interp(t, xs, ys)

def smooth(x, ms=30):
    k = max(2, int(SR * ms / 1000))
    w = np.hanning(k); w /= w.sum()
    return np.convolve(x, w, mode='same')

def lowpass(x, cutoff):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / cutoff) ** 6)
    return np.fft.irfft(X, n=len(x))

def highpass(x, cutoff):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= (f / cutoff) ** 2 / (1 + (f / cutoff) ** 2)
    return np.fft.irfft(X, n=len(x))

def stereo():
    return np.zeros(N), np.zeros(N)

def place(buf, i0, sig):
    i1 = min(N, i0 + len(sig))
    if i1 > i0:
        buf[i0:i1] += sig[: i1 - i0]

# ---- Shared stereo buses ----------------------------------------------------
padL, padR = stereo()
melL, melR = stereo()
bass = np.zeros(N)
pulse = np.zeros(N)
moveL, moveR = stereo()
air = np.zeros(N)
uiL, uiR = stereo()
shimL, shimR = stereo()

# ---- Air: faint pink room, always there -------------------------------------
nse = rng.normal(0, 1, N)
air = lowpass(nse, 700) * env([(0, 0.012), (6, 0.008), (12, 0.005), (58, 0.004), (DUR, 0.002)])

# ---- Pad: scene-aware chords, detuned sines + a few harmonics ---------------
# midi voicings stay in a close, modern register
chords = [
    (0.0,   [62, 69],                0.22),   # thin D5+A — memory missing
    (6.0,   [50, 57, 62, 66, 69],    0.55),   # Dadd9 — meeting
    (12.0,  [50, 57, 62, 66, 71],    0.62),   # D6 — commitments lock
    (17.5,  [47, 54, 62, 66, 69],    0.58),   # Bm11 — looking back
    (26.5,  [43, 50, 59, 62, 66],    0.64),   # Gmaj7 — people
    (33.5,  [45, 52, 57, 64, 69],    0.42),   # Asus2 — privacy, quieter
    (39.5,  [45, 52, 61, 64, 69],    0.58),   # A — conversation
    (47.0,  [43, 50, 59, 62, 67],    0.70),   # G — action
    (53.0,  [50, 57, 62, 66, 69],    0.78),   # D — network gathers
    (58.0,  [50, 57, 62, 66],        0.55),   # thin for the three lines
    (61.55, [],                      0.00),   # breath
    (62.20, [38, 50, 57, 62, 66, 69, 74, 81], 1.00),  # Dmaj9 resolve
]
for i, (st, notes, wt) in enumerate(chords):
    en = chords[i + 1][0] if i + 1 < len(chords) else DUR
    rise = 2.2 if st < 61 else 0.9
    fall = 2.4 if en < DUR - 0.5 else 0.8
    a = env([(0, 0), (max(0, st - 0.02), 0), (st + rise, wt),
             (max(st + rise, en - 0.15), wt), (min(DUR, en + fall), 0), (DUR, 0)])
    if not notes:
        continue
    for n in notes:
        f0 = hz(n)
        for h, hamp in ((1, 1.0), (2, 0.18), (3, 0.07)):
            f = f0 * h
            lfo = 1 + 0.015 * np.sin(2 * np.pi * (0.04 + n * 0.0011) * t + n)
            padL += a * lfo * np.sin(2 * np.pi * (f - 0.11) * t + n * 0.4) * hamp / len(notes)
            padR += a * lfo * np.sin(2 * np.pi * (f + 0.13) * t + n * 0.7) * hamp / len(notes)
padL = lowpass(padL, 1800)
padR = lowpass(padR, 1900)
# dip under the brand silence, bloom on the lockup
shape = env([(0, 0.15), (5.8, 0.2), (9, 0.55), (17, 0.62), (33, 0.7),
             (34, 0.48), (39, 0.5), (47, 0.72), (57.5, 0.88),
             (61.2, 0.35), (61.7, 0.0), (62.15, 0.0), (63.1, 0.95),
             (DUR - 1.2, 0.7), (DUR, 0)])
padL *= shape
padR *= shape

# ---- Bass: felt, not heard — scene roots ------------------------------------
roots = [(6.0, 38, 17.5), (17.5, 35, 26.5), (26.5, 31, 33.5),
         (39.5, 33, 47.0), (47.0, 31, 53.0), (53.0, 38, 61.5),
         (62.20, 26, DUR)]
for st, midi, en in roots:
    a = env([(0, 0), (st, 0), (st + 1.4, 1), (en - 0.2, 1), (en + 0.8, 0), (DUR, 0)])
    f = hz(midi)
    bass += a * np.sin(2 * np.pi * f * t) * (1 + 0.08 * np.sin(2 * np.pi * 0.12 * t))
    bass += 0.12 * a * np.sin(2 * np.pi * 2 * f * t)
bass = lowpass(bass, 220) * env([(0, 0), (6, 0), (8, 0.22), (53, 0.28),
                                  (61.5, 0.1), (62.2, 0.0), (63.0, 0.34), (DUR, 0.2)])

# ---- Motif / melody: D–F#–A–E, then resolve to D ----------------------------
# Soft piano-like additive plucks, placed on picture.
def pluck(busL, busR, at, midi, gain=0.12, decay=5.5, width=0.18):
    i0 = int(at * SR)
    L = int(min(2.8, DUR - at + 0.05) * SR)
    if L < 64 or i0 >= N:
        return
    tt = np.arange(L) / SR
    f = hz(midi)
    tone = (np.sin(2 * np.pi * f * tt)
            + 0.28 * np.sin(2 * np.pi * 2 * f * tt)
            + 0.10 * np.sin(2 * np.pi * 3 * f * tt)
            + 0.04 * np.sin(2 * np.pi * 4.02 * f * tt))
    att = 1 - np.exp(-tt * 380)
    body = np.exp(-tt * decay)
    click = rng.normal(0, 1, L) * np.exp(-tt * 220) * 0.12
    sig = (tone * att * body + click) * gain
    sig = lowpass(sig, 4200)
    pan = 0.5 + width
    place(busL, i0, sig * (1.15 - pan))
    place(busR, i0, sig * pan)

# problem headlines — two notes, unfinished
pluck(melL, melR, PROBLEM_H1, 74, 0.09, 4.2, -0.12)   # D5
pluck(melL, melR, PROBLEM_H2, 78, 0.08, 3.8, 0.16)    # F#5, no resolve

# meeting highlights — three words lift out
for at, n, w in zip(HIGHLIGHTS, (69, 74, 78), (-0.2, 0.0, 0.2)):
    pluck(melL, melR, at, n, 0.07, 5.0, w)

# extraction resolves — cards click into place
pluck(melL, melR, RESOLVES[0], 81, 0.10, 4.5, -0.08)  # A5
pluck(melL, melR, RESOLVES[1], 74, 0.09, 5.5, 0.10)   # D5

# provenance click — the film's first real accent
pluck(melL, melR, CLICK, 81, 0.14, 3.5, 0.0)
pluck(melL, melR, PLAY, 78, 0.08, 6.0, 0.12)

# relationships arrive one by one
for at, n, w in zip(ROWS, (66, 69, 74, 78), (-0.22, -0.08, 0.08, 0.22)):
    pluck(melL, melR, at, n, 0.075, 5.8, w)

# chat: question (up) / answer (down, in key)
pluck(melL, melR, Q1, 74, 0.08, 4.0, -0.15)
pluck(melL, melR, A1, 69, 0.09, 5.5, 0.12)
pluck(melL, melR, Q2, 78, 0.08, 4.0, -0.1)
pluck(melL, melR, A2, 74, 0.09, 5.0, 0.14)
pluck(melL, melR, Q3, 81, 0.085, 4.2, 0.0)

# brand phrases climb, then the lockup + hero resolve the motif
pluck(melL, melR, PHRASES[0], 69, 0.07, 4.5, -0.12)
pluck(melL, melR, PHRASES[1], 74, 0.08, 4.5, 0.0)
pluck(melL, melR, PHRASES[2], 78, 0.09, 3.2, 0.12)
pluck(melL, melR, LOCKUP, 74, 0.13, 3.8, -0.06)       # D
pluck(melL, melR, LOCKUP + 0.18, 81, 0.11, 4.0, 0.08) # A
pluck(melL, melR, HERO, 86, 0.12, 3.2, 0.0)           # D6
pluck(melL, melR, HERO + 0.22, 81, 0.08, 5.5, 0.1)
pluck(melL, melR, CTA, 74, 0.06, 6.0, 0.0)

# ---- Pulse: a quiet heartbeat that becomes the network ----------------------
beat = 0.75  # 80 bpm
start = CLICK
for k in range(int((59.2 - start) / beat)):
    s = start + k * beat
    i0 = int(s * SR)
    L = int(0.42 * SR)
    if i0 + L >= N:
        break
    tt = np.arange(L) / SR
    g = 1.0 if k % 2 == 0 else 0.52
    # down-sweep kick, very soft
    pulse[i0:i0 + L] += g * np.sin(2 * np.pi * (68 - 28 * tt) * tt) * np.exp(-tt * 13)
pulse *= env([(0, 0), (CLICK, 0), (CLICK + 2.2, 0.14), (33, 0.12),
              (39.5, 0.16), (53, 0.18), (NET_PULSE, 0.32),
              (57.6, 0.28), (59.0, 0.0), (DUR, 0)])

# ---- Movement: rising connective figures (privacy → action) -----------------
# Eighth-note cells that feel like signals hopping between people.
cells = {
    33.5: [69, 66, 62, 66],
    39.5: [69, 74, 71, 69],
    47.0: [74, 78, 76, 74],
    53.0: [78, 81, 74, 81],
}
step = beat / 2
for st, seq in cells.items():
    en = 39.5 if st < 39 else (47 if st < 47 else (53 if st < 53 else 58.6))
    k0 = int(st / step)
    k1 = int(en / step)
    for k in range(k0, k1):
        s = k * step
        n = seq[k % len(seq)]
        i0 = int(s * SR)
        L = int(0.7 * SR)
        if i0 + L >= N:
            break
        tt = np.arange(L) / SR
        f = hz(n)
        tone = np.sin(2 * np.pi * f * tt) + 0.2 * np.sin(2 * np.pi * 2 * f * tt)
        sig = tone * np.exp(-tt * 7) * (1 - np.exp(-tt * 320))
        side = 0.35 if (k % 2 == 0) else -0.35
        place(moveL, i0, sig * (0.5 - side))
        place(moveR, i0, sig * (0.5 + side))
moveL = lowpass(moveL, 2800)
moveR = lowpass(moveR, 2900)
mv = env([(0, 0), (33.5, 0), (35.5, 0.045), (39.5, 0.055),
          (47, 0.07), (53, 0.09), (57.8, 0.06), (59.0, 0), (DUR, 0)])
moveL *= mv
moveR *= mv

# ---- Brand shimmer: high cluster that opens with the lockup -----------------
for midi, det, g in ((86, -0.2, 0.18), (88, 0.15, 0.10), (93, 0.4, 0.07), (81, -0.35, 0.12)):
    a = env([(0, 0), (LOCKUP, 0), (LOCKUP + 0.8, g), (DUR - 1.4, g * 0.7), (DUR, 0)])
    f = hz(midi)
    shimL += a * np.sin(2 * np.pi * (f + det) * t)
    shimR += a * np.sin(2 * np.pi * (f - det) * t)
shimL = highpass(lowpass(shimL, 7000), 1200)
shimR = highpass(lowpass(shimR, 7200), 1200)

# ---- UI: quiet, in-key confirmations ----------------------------------------
def tick(at, gain=0.055, tone=None, pan=0.0):
    i0 = int(at * SR)
    L = int(0.22 * SR)
    if i0 >= N:
        return
    tt = np.arange(L) / SR
    click = rng.normal(0, 1, L) * np.exp(-tt * 200)
    click = lowpass(np.concatenate([click, np.zeros(2048)]), 5400)[:L]
    s = click * gain
    if tone:
        s += 0.42 * gain * np.sin(2 * np.pi * tone * tt) * np.exp(-tt * 16)
    place(uiL, i0, s * (0.55 - pan * 0.35))
    place(uiR, i0, s * (0.55 + pan * 0.35))

tick(12.80, 0.04, hz(81), -0.2)     # frame
tick(14.20, 0.055, hz(81), -0.1)    # resolve
tick(14.55, 0.05, hz(78), 0.15)     # open question
tick(CLICK, 0.09)                   # View moment
tick(EXPAND, 0.035, hz(74))
tick(LAND, 0.04, hz(81), 0.2)
tick(CONNECT, 0.035, hz(76))
tick(43.20, 0.035)                  # hover source
tick(Q2, 0.05)
tick(A2, 0.03, hz(78))
tick(Q3, 0.05)
tick(48.30, 0.035, hz(74))          # draft recomposes
tick(52.00, 0.045)                  # hover Review
tick(NET_PULSE, 0.04, hz(69))

# ---- Mix + short hall -------------------------------------------------------
dryL = (padL * 0.48 + melL + moveL + uiL + shimL * 0.22
        + (bass + pulse + air) * 0.92)
dryR = (padR * 0.48 + melR + moveR + uiR + shimR * 0.22
        + (bass + pulse + air) * 0.92)

ir_len = int(2.4 * SR)
ir = rng.normal(0, 1, ir_len) * np.exp(-np.arange(ir_len) / SR * 2.9)
ir = lowpass(ir, 3200)
ir /= np.sqrt(np.sum(ir ** 2)) * 3.4
M = 1 << int(np.ceil(np.log2(N + ir_len)))
def verb(x):
    y = np.fft.irfft(np.fft.rfft(x, M) * np.fft.rfft(ir, M), M)[:N]
    return y
wetL, wetR = verb(dryL), verb(dryR)

peak = max(np.max(np.abs(dryL)), np.max(np.abs(dryR)),
           np.max(np.abs(wetL)), np.max(np.abs(wetR)), 1e-9)
dryL, dryR, wetL, wetR = dryL / peak, dryR / peak, wetL / peak, wetR / peak

L = dryL * 0.74 + wetL * 0.38
R = dryR * 0.74 + wetR * 0.38
# tiny extra width on the resolve
wide = env([(0, 0), (LOCKUP, 0), (HERO, 0.08), (DUR, 0.05)])
L, R = L + R * wide * 0.15, R + L * wide * 0.15

fade = env([(0, 1), (DUR - 1.15, 1), (DUR, 0)])
st = np.stack([L * fade, R * fade], 1)
st = st / (np.max(np.abs(st)) + 1e-9) * 10 ** (-3 / 20)

pcm = (st * 32767).astype(np.int16)
with wave.open('audio/score.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
ff = ffmpeg_bin()
if not ff:
    raise SystemExit('ffmpeg not found — install ffmpeg or: pip install imageio-ffmpeg')
subprocess.run(
    [ff, '-y', '-loglevel', 'error', '-i', 'audio/score.wav',
     '-af', 'loudnorm=I=-18:TP=-2', '-ar', '48000', '-b:a', '192k',
     'public/score.mp3'],
    check=True,
)
print('wrote public/score.mp3')
