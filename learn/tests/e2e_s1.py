"""End-to-end test of Section 1 (1.1 to 1.4) and the English bands, in demo mode at phone, tablet and laptop sizes.
Usage: node learn/tests/dump_s1.mjs > s1.json; python3 learn/tests/e2e_s1.py BASE_URL s1.json SHOT_DIR"""
import json, sys, re
from playwright.sync_api import sync_playwright

BASE, D, SHOTS = sys.argv[1], json.load(open(sys.argv[2])), sys.argv[3]
SIZES = {k: v for k, v in {'phone': (390, 844), 'tablet': (820, 1180), 'laptop': (1366, 768)}.items() if len(sys.argv) < 5 or k in sys.argv[4].split(',')}
norm = lambda s: re.sub(r'\s+', ' ', s).strip()
MCQ = {}
for q in D['MCQ']: MCQ[norm(q['stem'])] = q; MCQ[norm(q['plain'])] = q
PPC = {it['title']: it for it in D['PPC']}
fails, checks, errors = [], 0, []

CEL = """window.__cel = []; new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => {
  if (n.nodeType === 1 && n.classList.contains('celbig')) { window.__cel.push(n.querySelector('.celtitle').textContent); setTimeout(() => n.click(), 750); }
  if (n.nodeType === 1 && n.classList.contains('celchip')) window.__cel.push('chip');
}))).observe(document, { childList: true, subtree: true });"""  # records celebrations and taps the big ones away, as a student would

def ok(cond, msg):
    global checks
    checks += 1
    if not cond: fails.append(msg); print('  FAIL', msg)

def no_overflow(p, where):
    sw = p.evaluate('document.documentElement.scrollWidth'); iw = p.evaluate('innerWidth')
    ok(sw <= iw + 1, f'{where}: page wider than screen ({sw} > {iw})')

def shot(p, size, name): p.screenshot(path=f'{SHOTS}/{size}-s1-{name}.png', full_page=False)

def student(p, user):
    p.goto(BASE + '/learn/?demo=1'); p.wait_for_selector('#f')
    p.fill('#u', user); p.fill('#p', '1234'); p.click('#f button'); p.wait_for_selector('#out')

def logout(p): p.goto(BASE + '/learn/?demo=1#/'); p.wait_for_selector('#out'); p.click('#out'); p.wait_for_selector('#f')

def baseline(p, size, n_right):
    p.goto(BASE + '/learn/?demo=1#/baseline'); p.click('#go')
    k = 0
    for t, T in enumerate(D['BASELINE']):
        p.wait_for_selector('.passage'); ok(T['title'] in p.inner_text('.passage'), f'baseline text {t+1} shown')
        if t == 0 and size: shot(p, size, '1-baseline'); no_overflow(p, size + ' baseline')
        ok(p.locator('#hint').count() == 0 and p.locator('.pillterm').count() == 0, 'baseline: no hints or pills')
        for qi, q in enumerate(T['qs']):
            box = p.locator(f'.bq[data-q="{qi}"]'); want = q['options'][0] if k < n_right else q['options'][1]
            box.locator('.choice').filter(has_text=want).first.click(); k += 1
        p.click('#next')
    p.wait_for_selector('text=Baseline done'); p.wait_for_selector('#saved:has-text("Saved")')
    ok(f'{n_right} / 12' in p.inner_text('main'), f'baseline score {n_right}/12')
    return p.inner_text('main')

def mcq_round(p, unit, band, size=None, use_pill=False):
    p.goto(BASE + f'/learn/?demo=1#/u/{unit}/mcq')
    for i in range(10):
        p.wait_for_selector('.event')
        q = MCQ.get(norm(p.locator('.event').inner_text()))
        ok(q is not None and q['unit'] == unit, f'{unit} mcq {i+1}: question found')
        if not q: return
        n = p.locator('.choice').count()
        if band == 0: ok(n == 3, f'{unit} A1: three options ({n})')
        else: ok(n == 4, f'band {band}: four options ({n})')
        if band == 3: ok(p.locator('.pillterm').count() == 0 and p.locator('#hint').count() == 0, 'B2: no pills, no hint')
        if band <= 1: ok(norm(p.locator('.event').inner_text()) == norm(q['plain']), f'band {band}: plain stem')
        if band >= 2: ok(norm(p.locator('.event').inner_text()) == norm(q['stem']), f'band {band}: exam stem')
        if i == 0 and use_pill and p.locator('.choices .pillterm, .event .pillterm').count():
            pill = p.locator('.choices .pillterm, .event .pillterm').first; pill.click()
            ok(p.locator('.gloss').count() == 1, 'pill opens a definition'); ok(p.locator('.choice.right, .choice.wrong').count() == 0, 'pill tap does not choose an answer')
            ok(('Tiếng Việt' in p.inner_text('.gloss')) == (band == 0 and VI_ON[0]), f'pill Vietnamese shown only at A1 with VI on (band {band})')
            if size: shot(p, size, f'2-mcq-band{band}-pill'); no_overflow(p, f'{size} mcq band {band}')
            pill.click(); ok(p.locator('.gloss').count() == 0, 'second tap closes the definition')
        ok((p.locator('#vibtn').count() == 1) == (band == 0 and VI_ON[0]), f'Tiếng Việt button only at A1 with VI on (band {band})')
        btns = p.locator('.choice'); texts = [norm(btns.nth(k).locator('.otext').inner_text()) for k in range(n)]
        idx = next((k for k, t in enumerate(texts) if t in [norm(x) for x in q['right']]), None)
        ok(idx is not None, f'{unit} mcq {i+1} band {band}: right answer is on screen {texts} {q["right"]}')
        POS.append(idx)
        btns.nth(idx or 0).locator('b').first.click(); p.click('#nx')
        if p.locator('#ok').count(): p.click('#ok')
        if p.locator('text=Paper 1 practice done').count(): break
    p.wait_for_selector('text=Paper 1 practice done'); p.wait_for_selector('#saved:has-text("Saved")')

def p2_round(p, unit, band, size=None):
    p.goto(BASE + f'/learn/?demo=1#/u/{unit}/p2')
    qs = [q for q in D['P2'] if q['unit'] == unit]
    for i in range(len(qs)):
        p.wait_for_selector('#work')
        if band == 0:
            ok(p.locator('ol.chain .ctile').count() >= 3, 'A1 Paper 2: ordering task')
            texts = [norm(x) for x in p.locator('.ctile .ctext').all_inner_texts()]
            q = next(q for q in qs if sorted(norm(c) for c in q['chain']) == sorted(texts))
            if i == 0 and size: shot(p, size, '3-p2-order'); no_overflow(p, size + ' p2 order')
            for target, line in enumerate(q['chain']):
                cur = [norm(x) for x in p.locator('.ctile .ctext').all_inner_texts()].index(norm(line))
                for _ in range(cur - target): p.click(f'[data-up="{cur}"]'); cur -= 1
            p.click('#chk')
        elif band == 1:
            ok(p.locator('select.gap').count() >= 2 and p.locator('.bank .chip').count() >= 3, 'A2 Paper 2: word bank with gaps')
            q = next(q for q in qs if len(q['gaps']) == p.locator('select.gap').count() and all(g in p.inner_text('.bank') for g in q['gaps']) and norm(q['chain'][0].split(q['gaps'][0])[0]) in norm(p.inner_text('.gapped')))
            if i == 0 and size: shot(p, size, '4-p2-bank'); no_overflow(p, size + ' p2 bank')
            for k, gword in enumerate(q['gaps']): p.select_option(f'select.gap[data-g="{k}"]', gword)
            p.click('#chk')
        else:
            ok(p.locator('textarea#ans').count() == 1, 'B1/B2 Paper 2: written answer')
            ok((p.locator('p.frame').count() == 1) == (band == 2), f'sentence frame only at B1 (band {band})')
            ok(p.locator('#hint').count() == 0, f'no hint button for written answers (band {band})')
            if i == 0 and size: shot(p, size, f'5-p2-band{band}'); no_overflow(p, f'{size} p2 band {band}')
            # a full answer: every model chain sentence for all questions of the unit gives every keyword group
            p.fill('#ans', ' '.join(' '.join(c['chain']) for c in qs)); p.click('#chk')
        p.wait_for_selector('#nx'); ok(p.locator('#fb .fb.ok').count() == 1, f'{unit} p2 q{i+1} band {band}: full marks')
        p.click('#nx')
    p.wait_for_selector('text=Paper 2 builder done'); p.wait_for_selector('#saved:has-text("Saved")')
    return p.inner_text('main')

def ppc_round(p, size):
    p.goto(BASE + '/learn/?demo=1#/u/1.4/ppc')
    for i in range(6):
        p.wait_for_selector('#step h3'); title = p.locator('.event').inner_text().strip(); it = PPC.get(title)
        ok(it is not None, f'ppc {i+1}: item found ({title})')
        ok(p.locator('#pg svg .ppc-curve').count() == 1, 'ppc: curve drawn')
        if i == 0: shot(p, size, '6-ppc'); no_overflow(p, size + ' ppc')
        for st in it['steps']:
            p.wait_for_selector('#step h3')
            if st['type'] == 'choice':
                t = next(o['t'] for o in st['options'] if o['v'] == st['answer']); p.locator('#step .choice').filter(has_text=t).first.click()
            else: p.fill('#num', str(st['answer'])); p.click('#chk')
        ok(p.locator('#step .fb.ok').count() == 1, f'ppc {it["id"]}: solved')
        if it.get('shift'): p.wait_for_timeout(900); ok(p.locator('.ppc-old').get_attribute('style') in ('', None) or 'none' not in (p.locator('.ppc-old').get_attribute('style') or ''), 'ppc shift: old curve shown dashed')
        if it.get('arrow'): ok(p.locator('.ppc-drop').count() == 1, 'ppc: opportunity-cost arrow drawn')
        if it.get('shift') and 'shift' not in DONE: DONE.add('shift'); shot(p, size, '7-ppc-shift')
        p.click('#nx')
        if p.locator('#ok').count(): p.click('#ok')
    p.wait_for_selector('text=PPC explorer done'); p.wait_for_selector('#saved:has-text("Saved")')

def teacher(p, size, band=None, vi=None):
    p.goto(BASE + '/learn/teacher.html?demo=1'); p.wait_for_selector('#u, .tabs')
    if p.locator('#u').count(): p.fill('#u', 'teacher'); p.fill('#p', 'demo'); p.click('form button'); p.wait_for_selector('.tabs')
    if vi is not None:
        p.click('.tabs [role=tab]:has-text("Manage class"), .tabs button:has-text("Manage class")'); p.wait_for_selector('#vi')
        if p.is_checked('#vi') != vi: p.click('#vi'); p.wait_for_timeout(300)
        ok(p.is_checked('#vi') == vi, f'teacher: Vietnamese switch {vi}'); shot(p, size, '9-teacher-vi')
    if band is not None:
        p.click('.tabs [role=tab]:has-text("Students"), .tabs button:has-text("Students")'); p.wait_for_selector('table.grid')
        ok('english' in p.inner_text('table.grid').lower(), 'teacher: English column')
        p.locator('a.sname', has_text='An').first.click(); p.wait_for_selector('#band')
        p.select_option('#band', '' if band == 'auto' else str(band)); p.wait_for_timeout(400)
        if size: shot(p, size, f'8-teacher-band'); no_overflow(p, size + ' teacher tracker')
        ok(('set by you' in p.inner_text('main')) == (band != 'auto'), f'teacher: override {band} shown')
    if p.locator('#out').count(): p.click('#out')

VI_ON = [True]
POS = []
DONE = set()

def run(p, size):
    p.goto(BASE + '/learn/?demo=1'); p.evaluate('localStorage.clear()')
    student(p, 'demo-01')
    ok('English and economics baseline' in p.inner_text('main'), 'home: baseline first'); shot(p, size, '0-home'); no_overflow(p, size + ' home')
    ok(p.locator('.wo-list a[href="#/baseline"], a[href="#/baseline"]').count() >= 1, 'home: baseline link')
    out = baseline(p, size, 3); ok('A1' in out, 'baseline 3/12 → A1')
    p.wait_for_function('window.__cel.length > 0'); ok('Your English level: A1' in p.evaluate('window.__cel'), 'baseline: big celebration with the level')
    p.goto(BASE + '/learn/?demo=1#/'); p.wait_for_selector('.stats'); ok('A1' in p.inner_text('.stats'), 'home stat shows A1')
    p.goto(BASE + '/learn/?demo=1#/units'); p.wait_for_selector('.ulist')
    ok('Section 1: The basic economic problem' in p.inner_text('main') and 'Section 2' in p.inner_text('main'), 'units grouped by section'); no_overflow(p, size + ' units')
    p.goto(BASE + '/learn/?demo=1#/u/1.1'); p.wait_for_selector('.utabs')
    tabs = p.locator('.utabs a').all_inner_texts(); ok('Paper 2' in ' '.join(tabs) and 'Practice' not in ' '.join(tabs), f'1.1 tabs: {tabs}')
    p.goto(BASE + '/learn/?demo=1#/u/1.1/tab/words'); p.wait_for_selector('table.lb'); ok('scarcity' in p.inner_text('table.lb') and 'khan hiếm' in p.inner_text('table.lb').lower() or 'scarcity' in p.inner_text('table.lb'), '1.1 key words with definitions')
    # A1
    mcq_round(p, '1.1', 0, size, use_pill=True)
    p2_round(p, '1.1', 0, size)
    # learn 1.4: PPC cards
    p.goto(BASE + '/learn/?demo=1#/u/1.4/learn'); p.wait_for_selector('[data-pt]')
    p.click('[data-pt="E"]'); ok('INSIDE' in p.inner_text('#eff'), 'learn PPC: point E explained'); ok(p.locator('.ppc-pt.hi').count() == 1, 'learn PPC: point highlighted')
    shot(p, size, '6a-learn-ppc'); no_overflow(p, size + ' learn ppc')
    p.click('#next'); p.wait_for_selector('[data-mv]'); p.click('[data-mv="CD"]'); ok('6 phones' in p.inner_text('#eff') or '6 million phones' in p.inner_text('#eff'), 'learn PPC: C→D opportunity cost')
    p.click('#next'); p.wait_for_selector('[data-sh]'); p.click('[data-sh="2"]'); p.wait_for_timeout(900); ok('rice' in p.inner_text('#eff'), 'learn PPC: rice-seed shift')
    shot(p, size, '6b-learn-shift')
    p.wait_for_timeout(300); ok('chip' in p.evaluate('window.__cel'), 'finishing an activity: XP chip and stars')
    ppc_round(p, size)
    p.wait_for_timeout(300); ok(any('Level up! You are now A2' in c for c in p.evaluate('window.__cel')), 'English level up: big celebration')
    p.goto(BASE + '/learn/?demo=1#/me'); p.wait_for_selector('.tcard'); ok('English level' in p.inner_text('main') and 'Baseline: 3/12' in p.inner_text('main'), 'Me: English level card')
    ok('A2' in p.inner_text('.tcard'), 'three strong A1 activities (Paper 1, Paper 2, PPC) moved the student up to A2'); shot(p, size, '10-me')
    logout(p)
    # teacher turns Vietnamese off: A1 sees no Vietnamese
    teacher(p, None, band=0); teacher(p, size, vi=False); VI_ON[0] = False
    student(p, 'demo-01'); mcq_round(p, '1.2', 0, None, use_pill=True); logout(p)
    teacher(p, size, vi=True); VI_ON[0] = True
    # teacher sets A2, B1, B2 in turn
    for b in (1, 2, 3):
        teacher(p, size if b == 2 else None, band=b)
        student(p, 'demo-01'); mcq_round(p, '1.3', b, size if b == 2 else None, use_pill=(b == 2)); p2_round(p, '1.3', b, size); logout(p)
    teacher(p, None, band='auto')
    # automatic band changes: demo-02 starts at B1 (9/12), three strong runs move them to B2
    student(p, 'demo-02'); out = baseline(p, None, 9); ok('B1' in out, 'baseline 9/12 → B1')
    for u in ('1.1', '1.2'): mcq_round(p, u, 2)
    out = p2_round(p, '1.4', 2)
    ok('level up' in out.lower(), 'three strong activities in a row: level up message')
    p.goto(BASE + '/learn/?demo=1#/me'); p.wait_for_selector('.tcard'); ok('B2' in p.inner_text('main'), 'band moved up to B2 automatically')
    logout(p)

with sync_playwright() as pw:
    b = pw.chromium.launch()
    for size, (w, h) in SIZES.items():
        print('==', size)
        ctx = b.new_context(viewport={'width': w, 'height': h}); p = ctx.new_page(); p.set_default_timeout(8000); p.add_init_script(CEL)
        p.on('pageerror', lambda e: errors.append(str(e)))
        try: run(p, size)
        except Exception as e: fails.append(f'{size}: {e}'); print('  ERROR', e); shot(p, size, 'zz-error')
        ctx.close()
    b.close()
ok(not errors, f'no page errors: {errors[:3]}')
from collections import Counter
c = Counter(POS); print('right-answer positions in Paper 1:', dict(sorted(c.items())))
ok(len(c) >= 3 and max(c.values()) / len(POS) < 0.5, f'Paper 1 answers are in random positions {dict(c)}')
print(f'{checks} checks, {len(fails)} failed')
sys.exit(1 if fails else 0)
