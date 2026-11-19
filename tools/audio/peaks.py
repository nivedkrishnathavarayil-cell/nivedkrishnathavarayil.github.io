"""Compute waveform peaks for an mp3 so the site's player can draw it.
Usage: python3 tools/audio/peaks.py <file.mp3> [bars]  -> prints a JSON list of 0..1 values"""
import subprocess, sys, json, array, math
f = sys.argv[1]; n = int(sys.argv[2]) if len(sys.argv) > 2 else 120
raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', f, '-ac', '1', '-ar', '8000', '-f', 's16le', '-'], capture_output=True, check=True).stdout
a = array.array('h'); a.frombytes(raw)
step = len(a) // n
vals = []
for i in range(n):
    seg = a[i*step:(i+1)*step]
    rms = math.sqrt(sum(x*x for x in seg) / max(1, len(seg)))
    vals.append(rms)
lo, hi = min(vals), max(vals) or 1
out = [round(0.16 + 0.84 * ((v - lo) / ((hi - lo) or 1)) ** 1.15, 2) for v in vals]
print(json.dumps(out))
