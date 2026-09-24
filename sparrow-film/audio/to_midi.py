"""Write the Sparrow score as a Type-1 MIDI for FL Studio.

  python audio/to_midi.py
  → audio/sparrow-score.mid
"""
from pathlib import Path

BPM = 80
TPQN = 480  # ticks per quarter
DUR = 66.0
CLICK = 19.80
LOCKUP, HERO, CTA = 62.25, 62.85, 63.85
NET_PULSE = 55.15


def sec_to_tick(s):
    return max(0, int(round(s * (BPM / 60.0) * TPQN)))


def vlq(value):
    parts = [value & 0x7F]
    value >>= 7
    while value:
        parts.append((value & 0x7F) | 0x80)
        value >>= 7
    return bytes(reversed(parts))


def vel(gain, lo=28, hi=108):
    return max(1, min(127, int(lo + gain * (hi - lo))))


class Track:
    def __init__(self, name, channel=0, program=None, is_drum=False):
        self.events = []  # (tick, pri, bytes)
        self.ch = 9 if is_drum else channel
        self.add(0, 0, bytes([0xFF, 0x03, len(name)]) + name.encode('ascii'))
        if program is not None and not is_drum:
            self.add(0, 1, bytes([0xC0 | self.ch, program]))

    def add(self, tick, pri, data):
        self.events.append((tick, pri, data))

    def note(self, start, dur, pitch, velocity):
        ch = self.ch
        on = sec_to_tick(start)
        off = max(on + 1, sec_to_tick(start + dur))
        self.add(on, 2, bytes([0x90 | ch, pitch, max(1, min(127, velocity))]))
        self.add(off, 3, bytes([0x80 | ch, pitch, 0]))

    def marker(self, start, text):
        raw = text.encode('ascii')
        self.add(sec_to_tick(start), 0, bytes([0xFF, 0x06, len(raw)]) + raw)

    def encode(self):
        self.events.sort(key=lambda e: (e[0], e[1]))
        body = bytearray()
        prev = 0
        for tick, _pri, data in self.events:
            body += vlq(tick - prev)
            body += data
            prev = tick
        body += vlq(0) + bytes([0xFF, 0x2F, 0x00])
        return b'MTrk' + len(body).to_bytes(4, 'big') + body


def build():
    tempo = Track('Tempo')
    # microseconds per quarter at 80 BPM
    mpq = int(60_000_000 / BPM)
    tempo.add(0, 0, bytes([0xFF, 0x51, 0x03, (mpq >> 16) & 0xFF, (mpq >> 8) & 0xFF, mpq & 0xFF]))
    tempo.add(0, 0, bytes([0xFF, 0x58, 0x04, 4, 2, 24, 8]))  # 4/4
    for t, name in (
        (0.0, 'Problem'),
        (6.0, 'Meeting'),
        (12.0, 'Extraction'),
        (17.5, 'Provenance'),
        (26.5, 'Relationships'),
        (33.5, 'Privacy'),
        (39.5, 'Chat'),
        (47.0, 'Action'),
        (53.0, 'Network'),
        (58.0, 'Brand'),
        (61.75, 'Silence'),
        (62.25, 'Lockup'),
    ):
        tempo.marker(t, name)

    # GM 89 Warm Pad
    pad = Track('Pad', channel=0, program=89)
    chords = [
        (0.0,   [62, 69],                0.22),
        (6.0,   [50, 57, 62, 66, 69],    0.55),
        (12.0,  [50, 57, 62, 66, 71],    0.62),
        (17.5,  [47, 54, 62, 66, 69],    0.58),
        (26.5,  [43, 50, 59, 62, 66],    0.64),
        (33.5,  [45, 52, 57, 64, 69],    0.42),
        (39.5,  [45, 52, 61, 64, 69],    0.58),
        (47.0,  [43, 50, 59, 62, 67],    0.70),
        (53.0,  [50, 57, 62, 66, 69],    0.78),
        (58.0,  [50, 57, 62, 66],        0.55),
        (61.55, [],                      0.00),
        (62.20, [38, 50, 57, 62, 66, 69, 74, 81], 1.00),
    ]
    for i, (st, notes, wt) in enumerate(chords):
        en = chords[i + 1][0] if i + 1 < len(chords) else DUR
        if not notes:
            continue
        for n in notes:
            pad.note(st, max(0.4, en - st), n, vel(wt))

    # GM 32 Acoustic Bass
    bass = Track('Bass', channel=1, program=32)
    for st, midi, en in (
        (6.0, 38, 17.5),
        (17.5, 35, 26.5),
        (26.5, 31, 33.5),
        (39.5, 33, 47.0),
        (47.0, 31, 53.0),
        (53.0, 38, 61.5),
        (62.20, 26, DUR),
    ):
        bass.note(st, en - st, midi, 82)

    # GM 0 Acoustic Grand
    mel = Track('Melody', channel=2, program=0)
    for at, n, g, d in (
        (3.70, 74, 0.09, 1.4),
        (4.45, 78, 0.08, 1.3),
        (8.10, 69, 0.07, 1.2),
        (8.50, 74, 0.07, 1.2),
        (8.90, 78, 0.07, 1.2),
        (14.20, 81, 0.10, 1.5),
        (14.55, 74, 0.09, 1.6),
        (19.80, 81, 0.14, 1.2),
        (20.80, 78, 0.08, 1.8),
        (27.75, 66, 0.075, 1.6),
        (28.30, 69, 0.075, 1.6),
        (28.85, 74, 0.075, 1.6),
        (29.40, 78, 0.075, 1.6),
        (40.35, 74, 0.08, 1.2),
        (41.65, 69, 0.09, 1.6),
        (44.20, 78, 0.08, 1.2),
        (45.25, 74, 0.09, 1.5),
        (47.15, 81, 0.085, 1.3),
        (59.30, 69, 0.07, 1.4),
        (60.15, 74, 0.08, 1.4),
        (61.00, 78, 0.09, 1.0),
        (LOCKUP, 74, 0.13, 1.2),
        (LOCKUP + 0.18, 81, 0.11, 1.3),
        (HERO, 86, 0.12, 1.1),
        (HERO + 0.22, 81, 0.08, 1.6),
        (CTA, 74, 0.06, 1.8),
    ):
        mel.note(at, d, n, vel(g, 48, 112))

    # GM 46 Orchestral Harp
    move = Track('Movement', channel=3, program=46)
    cells = {
        33.5: [69, 66, 62, 66],
        39.5: [69, 74, 71, 69],
        47.0: [74, 78, 76, 74],
        53.0: [78, 81, 74, 81],
    }
    beat = 0.75
    step = beat / 2
    for st, seq in cells.items():
        en = 39.5 if st < 39 else (47 if st < 47 else (53 if st < 53 else 58.6))
        for k in range(int(st / step), int(en / step)):
            move.note(k * step, 0.32, seq[k % len(seq)], 54)

    # Drums — kick on the 80 bpm grid from the click
    pulse = Track('Pulse', is_drum=True)
    k0 = 0
    while True:
        s = CLICK + k0 * beat
        if s >= 59.0:
            break
        pulse.note(s, 0.12, 36, 96 if k0 % 2 == 0 else 58)
        k0 += 1
    pulse.note(NET_PULSE, 0.18, 36, 110)

    # GM 101 Brightness
    shim = Track('Shimmer', channel=4, program=101)
    for n, g in ((86, 0.18), (88, 0.10), (93, 0.07), (81, 0.12)):
        shim.note(LOCKUP, DUR - LOCKUP, n, vel(g, 36, 90))

    # GM 112 Tinkle Bell — UI hits
    ui = Track('UI', channel=5, program=112)
    for at, n, g in (
        (12.80, 81, 0.04),
        (14.20, 81, 0.055),
        (14.55, 78, 0.05),
        (19.80, 74, 0.09),
        (19.95, 74, 0.035),
        (35.80, 81, 0.04),
        (36.55, 76, 0.035),
        (43.20, 81, 0.035),
        (44.20, 78, 0.05),
        (45.25, 78, 0.03),
        (47.15, 81, 0.05),
        (48.30, 74, 0.035),
        (52.00, 74, 0.045),
        (55.15, 69, 0.04),
    ):
        ui.note(at, 0.18, n, vel(g, 40, 100))

    tracks = [tempo, pad, bass, mel, move, pulse, shim, ui]
    header = b'MThd' + (6).to_bytes(4, 'big') + (1).to_bytes(2, 'big')
    header += len(tracks).to_bytes(2, 'big') + TPQN.to_bytes(2, 'big')
    return header + b''.join(tr.encode() for tr in tracks)


if __name__ == '__main__':
    out = Path(__file__).with_name('sparrow-score.mid')
    out.write_bytes(build())
    print(f'wrote {out}  (80 BPM, 66s, 7 parts + markers)')
