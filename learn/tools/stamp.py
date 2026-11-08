"""Version every file the browser loads, so a deploy never mixes new and cached old modules.
GitHub Pages lets browsers cache files for 10 minutes. index.html loads student.js?v=…, but the modules it imports
(./u1s.js, ./mission.js …) used to have no version, so a browser could pair a new student.js with an old cached u1s.js,
fail on a missing export and hang on the loading screen. This script puts the same ?v=<hash> on every relative import
and on the two HTML pages. Run it before every commit: python3 learn/tools/stamp.py"""
import hashlib, pathlib, re
L = pathlib.Path(__file__).resolve().parent.parent
IMP = re.compile(r"""(from\s+|import\s*\(\s*|import\s+)(['"])(\./[\w-]+\.js)(\?v=[0-9a-f]+)?\2""")
files = sorted((L / 'js').glob('*.js')) + sorted((L / 'css').glob('*.css'))
h = hashlib.sha1(b'stamp-v1')
for f in files: h.update(IMP.sub(lambda m: m.group(1) + m.group(2) + m.group(3) + m.group(2), f.read_text()).encode())
v = h.hexdigest()[:8]
for f in (L / 'js').glob('*.js'):
    s = f.read_text(); t = IMP.sub(lambda m: f"{m.group(1)}{m.group(2)}{m.group(3)}?v={v}{m.group(2)}", s)
    if t != s: f.write_text(t)
for f in (L / 'index.html', L / 'teacher.html'):
    s = f.read_text(); t = re.sub(r'\.(js|css)\?v=[0-9a-f]+', lambda m: f'.{m.group(1)}?v={v}', s)
    if t != s: f.write_text(t)
print('stamped', v)
