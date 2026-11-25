# Mix music + sfx + voiceover → audio/mix.wav at -14 LUFS integrated, ≤ -1 dBTP, 48 kHz 24-bit. Run from the project root.
#   python3 scripts/mix.py
# Inputs (any may be missing except music): audio/music.wav, audio/sfx.wav, audio/vo.wav
# Levels in dB from timeline.json "mix": { "music": 0, "sfx": -3, "vo": 0, "duck": true }
# The music is trimmed/padded to timeline.duration with a 0.3 s tail fade, and side-chain ducked under the VO.
import json, os, subprocess

TL = json.load(open('timeline.json'))
DUR = float(TL['duration'])
LV = {'music': 0.0, 'sfx': -3.0, 'vo': 0.0, 'duck': True, **(TL.get('mix') or {})}
have = {k: os.path.exists(f'audio/{k}.wav') for k in ('music', 'sfx', 'vo')}
if not have['music']: raise SystemExit('audio/music.wav missing (python3 scripts/music.py, or copy the supplied track there)')


def ff(args, capture=False):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-y', *args], capture_output=True, text=True)
    if r.returncode: raise SystemExit(r.stderr[-2000:])
    return r.stderr


# explicit duck envelope (timeline.mix.duck_db): music sits duck_db lower while each VO phrase plays (80 ms attack,
# 250 ms release), is lifted by end_lift_db from the end mark, and ducks only half as deep under the end-card VO.
MUSIC_SRC = 'music'
if 'duck_db' in LV and os.path.exists('audio/vo_placed.json'):
    import numpy as np, soundfile as sf
    y, sr = sf.read('audio/music.wav', always_2d=True)
    n = len(y); tt = np.arange(n) / sr
    G = json.load(open('beats.json')); BB = G['beats']; per = G.get('beat', 60 / TL['bpm'])
    bt = lambda b: BB[int(b)] + (b - int(b)) * per if int(b) < len(BB) else BB[-1] + (b - len(BB) + 1) * per
    t_end = bt(TL['marks']['end'])
    on = np.zeros(n)
    for p in json.load(open('audio/vo_placed.json')):
        on[(tt >= p['t0'] - 0.06) & (tt < p['t1'] + 0.12)] = 1
    # smooth: one-pole attack/release on the gate
    env = np.zeros(n); a_att, a_rel = 1 - np.exp(-1 / (0.08 * sr)), 1 - np.exp(-1 / (0.25 * sr)); z = 0.0
    for i in range(n):
        z += (a_att if on[i] > z else a_rel) * (on[i] - z); env[i] = z
    depth = np.where(tt >= t_end, LV['duck_db'] * 0.5, LV['duck_db'])
    lift = np.where(tt >= t_end, LV.get('end_lift_db', 0) * np.clip((tt - t_end) / 0.3, 0, 1), 0)
    gain = 10 ** ((env * depth + lift) / 20)
    sf.write('audio/music_duck.wav', y * gain[:, None], sr, subtype='FLOAT')
    MUSIC_SRC = 'music_duck'; LV['duck'] = False
inputs, chains, labels = [], [], []
def inp(name, gain, mono_to_stereo=False):
    inputs.extend(['-i', f'audio/{name}.wav']); i = len(inputs) // 2 - 1
    up = ',pan=stereo|c0=c0|c1=c0' if mono_to_stereo else ',aformat=channel_layouts=stereo'
    chains.append(f'[{i}:a]aresample=48000{up},apad,atrim=0:{DUR},volume={gain}dB[{name}]')
inp(MUSIC_SRC, LV['music'])
chains[-1] = chains[-1].replace(f'[{MUSIC_SRC}]', '[music]')
FO = float(LV.get('fade_out', 0.3))
chains[-1] = chains[-1].replace('[music]', f',afade=t=out:st={DUR - FO}:d={FO}[music]')
if have['sfx']: inp('sfx', LV['sfx'])
if have['vo']:
    inp('vo', LV['vo'], mono_to_stereo=True)
    if LV['duck']:
        chains.append('[vo]asplit[vo_out][vo_key]')
        chains.append('[music][vo_key]sidechaincompress=threshold=0.04:ratio=4:attack=15:release=280:makeup=1[music_out]')
ducked = have['vo'] and LV['duck']
labels = (['[music_out]'] if ducked else ['[music]']) + (['[sfx]'] if have['sfx'] else []) + ((['[vo_out]'] if ducked else ['[vo]']) if have['vo'] else [])
graph = ';'.join(chains) + f";{''.join(labels)}amix=inputs={len(labels)}:normalize=0:duration=first,alimiter=limit=0.95:level=false[mix]"
ff([*inputs, '-filter_complex', graph, '-map', '[mix]', '-c:a', 'pcm_f32le', 'audio/mix_raw.wav'])

# loudness: linear gain to -14 LUFS into a -1.5 dBFS limiter run at 4x oversampling (synth transients make
# inter-sample overs; a 48 kHz limiter lets true peak reach 0 dBTP), re-measured and corrected
def measure(path):
    e = ff(['-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'])
    summ = e[e.rfind('Summary'):]
    get = lambda k: float(next(l.split()[1] for l in summ.splitlines() if l.strip().startswith(k)))
    return get('I:'), get('Peak:')
I0, _ = measure('audio/mix_raw.wav'); gain = -14 - I0
for _ in range(3):
    ff(['-i', 'audio/mix_raw.wav', '-af', f'volume={gain:.2f}dB,aresample=192000,alimiter=limit=0.841:attack=1:release=40:level=false,aresample=48000', '-ar', '48000', '-c:a', 'pcm_s24le', 'audio/mix.wav'])
    I, TP = measure('audio/mix.wav')
    if abs(I + 14) <= 0.15: break
    gain += -14 - I
print(f"audio/mix.wav  inputs: {', '.join(k for k, v in have.items() if v)}  levels music {LV['music']} / sfx {LV['sfx']} / vo {LV['vo']} dB"
      f"{'  (music ducked under VO)' if have['vo'] and LV['duck'] else ''}")
print(f'integrated {I:.1f} LUFS (target -14)   true peak {TP:.1f} dBTP (limit -1)   gain {gain:+.1f} dB into the limiter')
if abs(I + 14) > 0.5 or TP > -1: print('WARNING: off target — the limiter is working too hard; lower the loudest stem (usually sfx) and rerun')
