"""End-to-end test of the section exam papers in demo mode at phone, tablet and laptop sizes.
Usage: node learn/tests/dump_papers.mjs > papers.json; python3 learn/tests/e2e_papers.py BASE_URL papers.json SHOT_DIR [sizes]"""
import json, sys, re
from playwright.sync_api import sync_playwright

BASE, D, SHOTS = sys.argv[1], json.load(open(sys.argv[2])), sys.argv[3]
SIZES = {k: v for k, v in {'phone': (390, 844), 'tablet': (820, 1180), 'laptop': (1366, 768)}.items() if len(sys.argv) < 5 or k in sys.argv[4].split(',')}
norm = lambda s: re.sub(r'\s+', ' ', s).strip()
fails, checks, errors = [], 0, []
CEL = """new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1 && n.classList.contains('celbig')) setTimeout(() => n.click(), 500); }))).observe(document, { childList: true, subtree: true });"""

def ok(cond, msg):
    global checks
    checks += 1
    if not cond: fails.append(msg); print('  FAIL', msg)
def no_overflow(p, where):
    sw = p.evaluate('document.documentElement.scrollWidth'); iw = p.evaluate('innerWidth')
    ok(sw <= iw + 1, f'{where}: page wider than screen ({sw} > {iw})')
def shot(p, size, name): p.screenshot(path=f'{SHOTS}/{size}-papers-{name}.png', full_page=False)
def url(h, ai=False): return BASE + '/learn/?demo=1' + ('&aidemo=1' if ai else '') + h

def paper1(p, size, unit, form, n_wrong):
    P = D[unit]; QS = {norm(q['stem']): q for q in P['p1'][form]}
    p.goto(url(f'#/u/{unit}/p1{form}')); p.wait_for_selector('.pstem')
    ok('⏱' in p.inner_text('#ptimer'), f'{unit} p1{form}: timer runs')
    seen = set()
    for i in range(20):
        p.wait_for_selector(f'#pcount:has-text("Question {i + 1} of 20")')
        q = QS[norm(p.inner_text('.pstem'))]; seen.add(q['id'])
        ok(p.locator('.pwhy:visible').count() == 0, f'{q["id"]}: no reasons before answering')
        ok(('ppc' in q) == (p.locator('#pppc svg').count() == 1) and ('table' in q) == (p.locator('table.sched').count() == 1), f'{q["id"]}: diagram or table shown when needed')
        btns = p.locator('.choice'); texts = [norm(btns.nth(k).locator('.otext').inner_text()) for k in range(4)]
        right = texts.index(norm(q['options'][0]['t'])); pick = right if i >= n_wrong else (right + 1) % 4
        if i == 0 and size: shot(p, size, f'p1-{unit}'); no_overflow(p, f'{size} paper 1 {unit}')
        btns.nth(pick).locator('b').first.click()
        ok(p.locator('.pwhy:visible').count() == 4, f'{q["id"]}: a reason for every option')
        ok(p.locator('.choice.right').count() == 1 and p.locator('.choice.wrong').count() == (0 if pick == right else 1), f'{q["id"]}: right and wrong shown')
        whys = [norm(o['why']) for o in q['options']]; shown = norm(p.inner_text('.choices'))
        ok(all(w in shown for w in whys), f'{q["id"]}: reasons match the options')
        if i == 0 and size: shot(p, size, f'p1-{unit}-revealed'); no_overflow(p, f'{size} paper 1 revealed')
        if i == 5:   # a reload in the middle keeps the paper
            p.reload(); p.wait_for_selector(f'#pcount:has-text("Question 7 of 20")')
        else: p.click('#nx')
    ok(len(seen) == 20, f'{unit} p1{form}: 20 different questions')
    p.wait_for_selector('#pscore'); ok(p.inner_text('#pscore') == str(20 - n_wrong), f'{unit} p1{form}: score {20 - n_wrong}/20')
    ok(p.locator('.punit').count() == len(P['covers']), f'{unit}: breakdown by unit'); ok(p.locator('.pmiss').count() == n_wrong, f'{unit}: {n_wrong} questions to look at again')
    if size: shot(p, size, f'p1-{unit}-score'); no_overflow(p, f'{size} paper 1 score')
    p.wait_for_timeout(900)

def place(p, text, slot=None, drag=False):
    t = p.locator('.pbank .ptile').filter(has_text=text).first
    if drag:
        a = t.bounding_box(); t.scroll_into_view_if_needed(); a = t.bounding_box()
        s = p.locator(f'.pslot[data-slot="{slot}"]'); b = s.bounding_box()
        p.mouse.move(a['x'] + a['width'] / 2, a['y'] + a['height'] / 2); p.mouse.down()
        p.mouse.move(a['x'] + a['width'] / 2 + 5, a['y'] + a['height'] / 2 + 12, steps=3)
        p.mouse.move(b['x'] + b['width'] / 2, b['y'] + b['height'] / 2, steps=8); p.mouse.up()
    else: t.click()

def paper2(p, size, unit, form, good, ai):
    P = D[unit]; sets = P['p2'][form]
    p.goto(url(f'#/u/{unit}/p2{form}', ai)); p.wait_for_selector('.pslots')
    built = written = 0; k = 0
    for si, s in enumerate(sets):
        for qi, q in enumerate(s['qs']):
            p.wait_for_selector('.pslots:not(.checked)'); n = len(q['chain'])
            ok(norm(s['case'])[:60] in norm(p.inner_text('.pcase')), f'{q["id"]}: case shown'); ok(('table' in s) == (p.locator('.pcase table').count() == 1), f'{q["id"]}: case table')
            ok(p.locator('.pbank .ptile').count() == n + len(q['traps']) and p.locator('#pcheck').is_disabled(), f'{q["id"]}: all tiles in the bank, check is off')
            if k == 0 and size: shot(p, size, f'p2-{unit}-build'); no_overflow(p, f'{size} paper 2 build')
            if k == 0:   # a real drag, then take it out by tapping, then go on
                place(p, q['chain'][0], 0, drag=True); ok(p.locator('.pslot[data-slot="0"] .ptile').count() == 1, 'drag and drop puts a tile in a box')
                p.locator('.pslot[data-slot="0"] .ptile').click(); ok(p.locator('.pslot .ptile').count() == 0, 'tapping a placed tile takes it out')
            want = list(q['chain'])
            if not good: want[-1] = q['traps'][0]['t']          # one trap tile in the last box
            for t in want: place(p, t)
            if k == 1 and not good:   # a reload keeps the tiles
                p.reload(); p.wait_for_selector('.pslots'); ok(p.locator('.pslot .ptile').count() == n, 'reload keeps the placed tiles')
            p.click('#pcheck'); p.wait_for_selector('#pbuilt'); b = n if good else n - 1; built += b
            ok(p.inner_text('#pbuilt').replace(' ', '') == f'{b}/{n}', f'{q["id"]}: chain {b}/{n}: ' + p.inner_text('#pbuilt'))
            if not good: ok(norm(q['traps'][0]['why']) in norm(p.inner_text('.pslots')), f'{q["id"]}: the trap tile says why it is wrong')
            if k == 0 and size: shot(p, size, f'p2-{unit}-built'); no_overflow(p, f'{size} paper 2 built')
            p.click('#pgo'); p.wait_for_selector('#ptext')
            ok(p.locator('.ptile').count() == 0 and p.locator('.worked').count() == 0, f'{q["id"]}: tiles and chain hidden while writing')
            if good: p.fill('#ptext', q['model']); p.click('#pmark'); w = q['marks']
            elif k % 2: p.click('#pskip'); w = 0
            else: p.fill('#ptext', 'I am not sure about this one.'); p.click('#pmark'); w = 0
            p.wait_for_selector('#pwrote'); written += w
            ok(p.inner_text('#pwrote').replace(' ', '') == f'{w}/{q["marks"]}', f'{q["id"]}: written {w}/{q["marks"]}: ' + p.inner_text('#pwrote'))
            ok(p.locator('.ppoints li').count() == len(q['groups']) and p.locator('.ppoints li.good').count() == (min(len(q['groups']), 99) if good and q['need'] == len(q['groups']) else p.locator('.ppoints li.good').count()), f'{q["id"]}: mark scheme points listed')
            ok(norm(q['model'])[:50] in norm(p.inner_text('#pq')), f'{q["id"]}: model answer shown')
            if good and ai: ok('marked by AI' in p.inner_text('#pq'), f'{q["id"]}: AI marking note')
            if k == 2 and size: shot(p, size, f'p2-{unit}-marked'); no_overflow(p, f'{size} paper 2 marked')
            p.click('#pnx'); k += 1
    p.wait_for_selector('#pscore')
    ok(p.inner_text('#pscore') == str(built + written), f'{unit} p2{form}: total {built + written}: ' + p.inner_text('#pscore'))
    ok(f'{written} / 24' in p.inner_text('#pwritten') and f'{built} / 24' in p.inner_text('#pchains'), f'{unit} p2{form}: written and chains shown')
    if size: shot(p, size, f'p2-{unit}-score'); no_overflow(p, f'{size} paper 2 score')
    p.wait_for_timeout(900)

def run(p, size):
    p.goto(url('')); p.wait_for_selector('#f'); p.fill('#u', 'demo-02'); p.fill('#p', '1234'); p.click('#f button'); p.wait_for_selector('#out')
    p.goto(url('#/units')); p.wait_for_selector('.ulist')
    ok(p.locator('a[href="#/u/1.P"]').count() == 0 and 'open the exam papers' in p.inner_text('.ulist'), 'papers are locked until the teacher opens them')
    p.goto(url('#/u/1.P/p1a')); p.wait_for_selector('.ulist, .hero'); ok(p.locator('.pstem').count() == 0, 'a locked paper cannot be opened by its address')
    p.evaluate("""() => { const d = JSON.parse(localStorage.getItem('ecl:demo:db')); d.classes.forEach(c => (c.open_units = [...new Set([...c.open_units, '1.P', '2.P'])])); localStorage.setItem('ecl:demo:db', JSON.stringify(d)); }""")
    p.goto(url('#/units')); p.reload(); p.wait_for_selector('a[href="#/u/1.P"]'); ok('0 of 4 papers done' in p.inner_text('a[href="#/u/1.P"]'), 'units: the papers row')
    p.click('a[href="#/u/1.P"]'); p.wait_for_selector('.pcard'); ok(p.locator('.pcard').count() == 4 and p.locator('.pcard:has-text("Not started")').count() == 4, 'papers page: four papers')
    if size: shot(p, size, 'home'); no_overflow(p, size + ' papers home')
    paper1(p, size, '1.P', 'a', 3); paper2(p, size, '1.P', 'a', True, True)
    paper1(p, None, '2.P', 'b', 0); paper2(p, size, '2.P', 'b', False, False)
    paper1(p, None, '1.P', 'b', 1); paper2(p, None, '2.P', 'a', True, False)
    p.goto(url('#/u/1.P')); p.wait_for_selector('.pcard'); t = p.inner_text('main')
    ok('Best 17/20' in t and 'Best 48/48' in t and 'Best 19/20' in t, 'papers page: best scores: ' + norm(t)[:300])
    p.goto(url('#/units')); p.wait_for_selector('a[href="#/u/1.P"]'); ok('3 of 4 papers done' in p.inner_text('a[href="#/u/1.P"]'), 'units: papers done count')
    p.goto(url('#/')); p.wait_for_selector('#out'); p.click('#out'); p.wait_for_selector('#f')
    # the teacher sees the papers
    p.fill('#u', 'teacher'); p.fill('#p', 'demo'); p.click('#f button'); p.wait_for_selector('.tabs')
    p.click('.tabs button:has-text("Units")'); p.wait_for_selector('.ulist'); t = p.inner_text('.ulist')
    ok('Section 1 exam papers' in t and 'Paper 1 A 1, B 1' in t, 'teacher: papers in the Units tab with counts')
    ok(p.locator('.ulist input[value="1.P"]').is_checked(), 'teacher: papers can be opened and closed')
    if size: shot(p, size, 'teacher-units'); no_overflow(p, size + ' teacher units')

with sync_playwright() as pw:
    b = pw.chromium.launch()
    for size, (w, h) in SIZES.items():
        print('==', size)
        ctx = b.new_context(viewport={'width': w, 'height': h}, has_touch=size != 'laptop'); p = ctx.new_page(); p.set_default_timeout(8000); p.add_init_script(CEL)
        p.on('pageerror', lambda e: errors.append(str(e))); p.on('console', lambda m: errors.append(m.text) if m.type == 'error' and 'favicon' not in m.text else None)
        try: run(p, size)
        except Exception as e: fails.append(f'{size}: CRASH {e}'); print('  CRASH', str(e)[:600]); p.screenshot(path=f'{SHOTS}/{size}-papers-crash.png')
        ctx.close()
    b.close()
ok(not errors, 'no JavaScript errors: ' + ' | '.join(errors[:3]))
print(f'{checks} checks, {len(fails)} failed'); sys.exit(1 if fails else 0)
