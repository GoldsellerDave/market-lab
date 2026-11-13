"""End-to-end test of EcoLogic Learn in demo mode at phone, tablet and laptop sizes.
Usage: python3 learn/tests/e2e_learn.py BASE_URL ITEMS_JSON SHOT_DIR [live]"""
import json, sys, re
from playwright.sync_api import sync_playwright

BASE, ITEMS, SHOTS = sys.argv[1], json.load(open(sys.argv[2])), sys.argv[3]
SIZES = {'phone': (390, 844), 'tablet': (820, 1180), 'laptop': (1366, 768)}
SHIFT_BY_EVENT = {s['event']: s for s in ITEMS['SHIFTS']}
MCQ_BY_STEM = {k: q for q in ITEMS['MCQ'] + ITEMS.get('MCQ24', []) for k in (q['stem'], q.get('plain'), ' '.join(q.get('plain', '').split())) if k}
def norm(t): return ' '.join(t.split())
def right_idx(p, q):
    """Index of the right option on screen (exam or plain wording; A1 shows three options)"""
    btns = p.locator('.choice'); rs = [norm(x) for x in q['rights']]
    texts = [norm(btns.nth(k).locator('.otext').inner_text() if btns.nth(k).locator('.otext').count() else btns.nth(k).inner_text()[1:]) for k in range(btns.count())]
    return next(k for k, t in enumerate(texts) if t in rs), texts
def q_on(p): return MCQ_BY_STEM.get(p.locator('.event').inner_text().strip()) or MCQ_BY_STEM[norm(p.locator('.event').inner_text())]
fails, checks = [], 0
VERBOSE = bool(__import__("os").environ.get("VERBOSE"))
SHOT_DONE = set()

CEL = """window.__cel = []; new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => {
  if (n.nodeType === 1 && n.classList.contains('celbig')) { window.__cel.push(n.querySelector('.celtitle').textContent); setTimeout(() => n.click(), 750); }
  if (n.nodeType === 1 && n.classList.contains('celchip')) window.__cel.push('chip');
}))).observe(document, { childList: true, subtree: true });"""  # records celebrations and taps the big ones away, as a student would

def ok(cond, msg):
    global checks
    checks += 1
    if not cond: fails.append(msg); print("  FAIL", msg)
    elif VERBOSE: print("  ok", msg)

def no_overflow(p, where):
    sw = p.evaluate('document.documentElement.scrollWidth'); iw = p.evaluate('innerWidth')
    ok(sw <= iw + 1, f'{where}: page wider than screen ({sw} > {iw})')

def shot(p, size, name):
    p.screenshot(path=f'{SHOTS}/{size}-{name}.png', full_page=False)

def solve_shift(p, wrong_first):
    ev = p.locator('.event').inner_text().strip()
    it = SHIFT_BY_EVENT[ev]
    if wrong_first:  # pick a wrong curve first
        wrong = next(c for c in ['D', 'S', 'both', 'none'] if c != it['curve'])
        p.click(f'[data-c="{wrong}"]'); ok(p.locator('.fb.no').count() == 1, 'shift: wrong curve gives feedback')
        ok(p.locator('.fb.tip').count() >= 1, 'shift: wrong curve shows a misconception tip')
    p.click(f'[data-c="{it["curve"]}"]')
    if it['curve'] != 'none':
        for c, v in it['dir'].items():
            p.click(f'.seg[data-curve="{c}"] button[data-v="{v}"]')
        p.click('#chk')
    for k, o in enumerate(it['out']):
        p.click(f'.seg[data-k="{k}"] button[data-v="{o["ans"]}"]')
    p.click('#chk')
    ok(p.locator('.fb.ok').count() == 1, f'shift {it["id"]}: solved')
    p.click('#nx')
    if p.locator('#ok').count():  # strategy card
        p.click('#ok')

def run_student(p, size):
    p.goto(BASE + '/learn/?demo=1'); p.evaluate('localStorage.clear()'); p.reload()
    p.fill('#u', 'demo-01'); p.fill('#p', '9999'); p.click('#f button')
    p.wait_for_selector('#err:not(:empty)'); ok('not right' in p.inner_text('#err'), 'wrong PIN message')
    shot(p, size, '1-signin'); no_overflow(p, size + ' signin')
    p.fill('#u', 'DEMO-01 '); p.fill('#p', '1234'); p.click('#f button')
    p.wait_for_selector('.qtile'); ok('Hi, An' in p.inner_text('.hero h1'), 'greeting')
    ok(p.locator('.workout').count() == 1 and p.locator('.qtile').count() == 6, 'home: workout card and six tiles')
    ok(p.locator('.bnav a').count() == 5, 'bottom navigation with five tabs')
    shot(p, size, '2a-home-top'); no_overflow(p, size + ' home')
    p.click('.bnav a[href="#/units"]'); p.wait_for_selector('.ulist')
    ok(p.locator('a.urow').count() == 6, '1.1 to 1.4, 2.4 and 2.5 open in the demo'); ok(p.locator('.urow').count() == 12, 'ten units and the two exam paper rows listed')
    shot(p, size, '2-home'); no_overflow(p, size + ' home')
    p.goto(BASE + '/learn/?demo=1#/me/settings'); p.wait_for_selector('[data-vi]'); p.click('[data-vi="true"]')
    ok(p.get_attribute('[data-vi="true"]', 'aria-selected') == 'true', 'Vietnamese words toggle')
    p.goto(BASE + '/learn/?demo=1#/u/2.5'); p.wait_for_selector('.msteps'); ok(p.locator('.utabs a').count() == 6, 'unit page: six tabs')
    ok(p.locator('.msteps li').count() == 7 and p.locator('.msteps li.locked').count() == 1, 'mission: seven steps (with scenarios), checkpoint locked')
    shot(p, size, '3-unit'); no_overflow(p, size + ' unit')
    for t in ['learn', 'practice', 'paper1', 'data', 'words']:
        p.goto(BASE + '/learn/?demo=1#/u/2.5/tab/' + t); p.wait_for_selector('[role=tabpanel]'); no_overflow(p, f'{size} unit tab {t}')
    p.goto(BASE + '/learn/?demo=1#/u/2.5'); p.wait_for_selector('.msteps')
    # Learn
    p.click('.msteps a[href$="/learn"]'); p.wait_for_selector('.steps'); ok(p.locator('.bnav').is_hidden(), 'bottom bar hidden during an activity')
    for i in range(5):
        p.wait_for_selector('.card h2')
        if p.locator('.choice[data-k]').count():
            p.locator('.choice[data-k]').last.click(); p.wait_for_timeout(850)
            ok(p.inner_text('#eff').strip() != '', f'learn card {i+1}: diagram explains effect')
            if i == 0: shot(p, size, '4-learn')
        no_overflow(p, f'{size} learn {i+1}')
        p.click('#next')
    p.wait_for_selector('text=Cards done'); p.goto(BASE + '/learn/?demo=1#/u/2.5/shift')
    # Shift detective (6 cases; first one with a wrong step, next two right to level up)
    for i in range(6):
        p.wait_for_selector('.event')
        if i == 0: shot(p, size, '5-shift-start')
        solve_shift(p, wrong_first=(i == 0))
        if i == 0: pass
    p.wait_for_selector('text=Shift detective done'); p.wait_for_selector('#saved:has-text("Saved")')
    ok('5 / 6' in p.inner_text('main'), 'shift score 5/6'); ok('+' in p.inner_text('.xp-gain') and 'XP' in p.inner_text('.xp-gain'), 'XP shown after shift run'); shot(p, size, '6-shift-result'); no_overflow(p, size + ' shift result')
    p.click('#back'); p.wait_for_selector('.msteps')
    # MCQ: two wrong first (rescue card), rest right
    p.click('.msteps a[href$="/mcq"]'); MISSED = set(); NMISS = [0]
    for i in range(10):
        p.wait_for_selector('.event')
        q = q_on(p)
        btns = p.locator('.choice'); ri, texts = right_idx(p, q)
        if i < 2:   # two misses on DIFFERENT ideas, so Build it up is offered but does not start by itself
            blk = lambda t: next((b for (et, pt, b) in q['blocks'] if norm(et) == t or norm(pt) == t), None)
            k = next((j for j in range(len(texts)) if j != ri and blk(texts[j]) not in MISSED), ri)   # no new idea to miss: answer right
            if k != ri: MISSED.add(blk(texts[k])); NMISS[0] += 1
        else: k = ri
        if i == 3: shot(p, size, '7-mcq')
        btns.nth(k).locator('b').first.click()
        ok(p.locator('.choice.right').count() == 1, f'mcq {i+1}: right answer shown')
        if i < 2 and k != ri: ok(p.locator('.fb.tip:not(.chainbox)').count() == 1, f'mcq {i+1}: trap tip on wrong answer')
        no_overflow(p, f'{size} mcq {i+1}')
        p.click('#nx')
        if p.locator('#ok').count():
            ok(i == 1 and NMISS[0] == 2, 'rescue card after two misses')
            ok(p.locator('text=Worked example').count() == 1, 'worked example at Core')
            p.wait_for_timeout(900); shot(p, size, '7b-worked-example'); no_overflow(p, size + ' worked example')
            p.click('#ok')
    p.wait_for_selector('text=Paper 1 practice done'); p.wait_for_selector('#saved:has-text("Saved")')
    ok(f'{10 - NMISS[0]} / 10' in p.inner_text('main'), f'mcq score {10 - NMISS[0]}/10')
    p.click('#back'); p.wait_for_selector('.msteps')
    # Data response
    p.click('.msteps a[href$="/data"]'); p.wait_for_selector('#qa')
    shot(p, size, '8-data'); no_overflow(p, size + ' data')
    p.fill('#qai', '40'); p.click('#qac'); ok('One more try' in p.inner_text('#qafb'), 'calc retry')
    p.fill('#qai', '50%'); p.click('#qac'); ok('1/2' in p.inner_text('#qafb'), 'calc second try 1/2')
    p.locator('#qa button:has-text("Next")').click()
    p.fill('#qbi', 'There was a long drought'); p.click('#qbc'); ok('1/1' in p.inner_text('#qbfb'), 'identify 1/1')
    p.locator('#qb button:has-text("Next")').click()
    p.click('#qc .seg[data-curve="D"] button[data-v="1"]'); p.click('#qc .seg[data-curve="S"] button[data-v="-1"]'); p.wait_for_timeout(800)
    p.click('#qcc'); ok('2/2' in p.inner_text('#qcfb'), 'diagram 2/2'); shot(p, size, '9-data-diagram')
    p.locator('#qc button:has-text("Next")').click()
    p.fill('#qdi', 'The drought made supply fall.'); p.click('#qdc'); ok('Improve' in p.inner_text('#qdfb'), 'explain: improve prompt')
    p.fill('#qdi', 'The drought cut the harvest so supply fell. Coffee drinking in China grew so demand increased. At the old price there was a shortage so the price rose.')
    p.click('#qdc'); ok('4/4' in p.inner_text('#qdfb'), 'explain 4/4')
    p.locator('#qd button:has-text("Finish")').click()
    p.wait_for_selector('#saved:has-text("Saved")'); ok('8 / 9' in p.inner_text('main'), 'data total 8/9')
    shot(p, size, '10-data-total'); no_overflow(p, size + ' data total')
    # The scenario cards are played in e2e_s1.py; here they are saved as solved so the checkpoint can open
    p.evaluate("""async () => { const A = await import('/learn/js/api.js'); const { SCEN_BY_UNIT } = await import('/learn/js/u1s.js');
      for (const s of SCEN_BY_UNIT['2.5']) await A.rpc('ec_save_attempt', { p_token: A.token.get(), p_unit: '2.5', p_activity: 'sc-' + s.id, p_level_start: 0, p_level_end: 0, p_score: 2, p_max: 2, p_seconds: 30, p_answers: [] }); }""")
    p.goto(BASE + '/learn/?demo=1#/u/2.5'); p.reload(); p.wait_for_selector('.msteps')
    ok(p.locator('.msteps li.done').count() == 6, 'mission: six steps done: ' + ' | '.join(p.locator('.msteps li').nth(k).get_attribute('class') + ':' + p.locator('.msteps li').nth(k).inner_text().replace(chr(10), ' ') for k in range(p.locator('.msteps li').count())))
    ok(p.locator('.msteps li.locked').count() == 0, 'checkpoint unlocked after the other steps')
    ok(p.locator('text=most common mistake').count() == 1, 'top mistake panel')
    shot(p, size, '11-unit-progress')
    # Review: the two missed Paper 1 questions come back
    p.goto(BASE + '/learn/?demo=1#/review'); p.wait_for_selector('.hero'); ok(p.locator('.bnav .nbadge').count() == 1, 'review badge on the tab bar')
    ok('due today' in p.inner_text('main'), 'review: questions due'); shot(p, size, '12a-review')
    p.click('a[href="#/review/go"]')
    while True:
        p.wait_for_selector('.event, h1:has-text("Review done")')
        if p.locator('text=Review done').count(): break
        q = q_on(p)
        p.locator('.choice').nth(right_idx(p, q)[0]).locator('b').first.click(); p.click('#nx')
    p.wait_for_selector('#saved:has-text("Saved")'); ok('Review done' in p.inner_text('main'), 'review run saved')
    p.goto(BASE + '/learn/?demo=1#/u/2.5'); p.wait_for_selector('.msteps')
    # Unit checkpoint: all right → passed and badge
    p.click('.msteps a[href$="/check"]')
    for i in range(12):
        p.wait_for_selector('.event'); q = q_on(p)
        p.locator('.choice').nth(right_idx(p, q)[0]).locator('b').first.click()
    p.wait_for_selector('#saved:has-text("Saved")'); ok('12 / 12' in p.inner_text('main') and 'Shift spotter' in p.inner_text('main'), 'checkpoint passed, badge won')
    shot(p, size, '11b-checkpoint'); no_overflow(p, size + ' checkpoint')
    p.goto(BASE + '/learn/?demo=1#/u/2.5'); p.wait_for_selector('.msteps'); ok('Badge won' in p.inner_text('.mission'), 'mission complete')
    # Me: stats and leaderboard
    p.goto(BASE + '/learn/?demo=1#/me'); p.wait_for_selector('.scard'); ok('Overall' in p.inner_text('.scard'), 'my stats: unit scores')
    shot(p, size, '12b-me'); no_overflow(p, size + ' me')
    p.goto(BASE + '/learn/?demo=1#/me/leaderboard'); p.wait_for_selector('table.lb'); ok('An (you)' in p.inner_text('table.lb'), 'leaderboard shows me')
    shot(p, size, '12-xp-board'); no_overflow(p, size + ' leaderboard')
    p.goto(BASE + '/learn/?demo=1#/games'); p.wait_for_selector('.tiles'); ok(p.locator('.atile').count() >= 5, 'games page tiles'); no_overflow(p, size + ' games')
    p.goto(BASE + '/learn/?demo=1#/'); p.wait_for_selector('.workout'); shot(p, size, '12c-home-after'); no_overflow(p, size + ' home after')
    # reload keeps the session; sign out works
    p.reload(); p.wait_for_selector('.hero h1'); ok(p.locator('#out').is_visible(), 'session survives reload')
    p.click('#out'); p.wait_for_selector('#f'); ok(not p.locator('#out').is_visible(), 'signed out: no sign-out button')

def run_struggler(p, size):
    # demo-02 gets every case wrong twice: answers are revealed, worked example appears, flagged for the teacher
    p.goto(BASE + '/learn/?demo=1'); p.wait_for_selector('#f')
    p.fill('#u', 'demo-02'); p.fill('#p', '1234'); p.click('#f button'); p.wait_for_selector('.hero h1')
    p.goto(BASE + '/learn/?demo=1#/u/2.5/shift')
    for i in range(6):
        p.wait_for_selector('.event')
        it = SHIFT_BY_EVENT[p.locator('.event').inner_text().strip()]
        wrongs = [c for c in ['D', 'S', 'both', 'none'] if c != it['curve']][:2]
        for c in wrongs: p.click(f'[data-c="{c}"]')
        ok(p.locator('text=Here is the answer').count() == 1, f'case {i+1}: answer revealed after two wrong tries')
        if i == 0: p.wait_for_timeout(900); shot(p, size, '5b-revealed'); no_overflow(p, size + ' revealed')
        p.click('#nx')
        if p.locator('#ok').count():
            ok(p.locator('text=Worked example').count() == 1, 'worked example for a struggling Core student'); p.click('#ok')
    p.wait_for_selector('text=Shift detective done'); p.wait_for_selector('#saved:has-text("Saved")')
    ok('0 / 6' in p.inner_text('main'), 'struggler score 0/6')
    p.click('#out'); p.wait_for_selector('#f')

def set_slider(p, v):
    p.evaluate(f"(() => {{ const s = document.querySelector('#pr'); s.value = {v}; s.dispatchEvent(new Event('input')); }})()")

def run_u24(p, size):
    p.goto(BASE + '/learn/?demo=1'); p.wait_for_selector('#f')
    p.fill('#u', 'demo-03'); p.fill('#p', '1234'); p.click('#f button'); p.wait_for_selector('.hero h1')
    p.goto(BASE + '/learn/?demo=1#/u/2.4'); p.wait_for_selector('.msteps')
    ok('2.4 Price determination' in p.inner_text('.uhead h2'), '2.4 page title'); ok('Equilibrium finder' in p.inner_text('.msteps'), '2.4 mission uses the finder')
    shot(p, size, 'u24-1-unit'); no_overflow(p, size + ' 2.4 unit')
    # Learn
    p.click('.msteps a[href$="/learn"]'); p.wait_for_selector('#pr')
    set_slider(p, 0); ok(p.inner_text('#rkind') == 'shortage' and '750' in p.inner_text('#rqd'), 'explorer: shortage at 20k')
    ok(p.locator('.dg-gaplab.shortage').count() == 1, 'diagram labels the shortage')
    shot(p, size, 'u24-2-explorer-short')
    set_slider(p, 3); ok(p.inner_text('#rkind') == 'equilibrium', 'explorer: equilibrium at 35k')
    set_slider(p, 6); ok(p.inner_text('#rkind') == 'surplus' and p.locator('.dg-gaplab.surplus').count() == 1, 'explorer: surplus at 50k')
    shot(p, size, 'u24-3-explorer-surplus'); no_overflow(p, size + ' explorer')
    p.click('#next'); p.wait_for_selector('#showeq'); p.click('#showeq'); ok(p.locator('tr.eqrow').count() == 1, 'schedule: equilibrium row highlighted')
    shot(p, size, 'u24-4-schedule'); no_overflow(p, size + ' schedule')
    p.click('#next'); p.wait_for_selector('#work'); p.click('#work')
    p.wait_for_function("document.querySelector('#eff') && document.querySelector('#eff').innerText.includes('reached equilibrium')", timeout=8000)
    ok(p.inner_text('#rkind') == 'equilibrium', 'let the market work ends at equilibrium')
    p.click('#next'); p.wait_for_selector('text=WHAT to produce?'); p.click('#next'); p.wait_for_selector('text=Sentence frame'); p.click('#next')
    p.wait_for_selector('text=Cards done'); ok('Scenario' in p.inner_text('#n'), 'learn leads to the scenarios'); p.goto(BASE + '/learn/?demo=1#/u/2.4/eqm')
    # Equilibrium finder: first question wrong twice (answer revealed), the rest right
    for i in range(6):
        p.wait_for_selector('.event')
        it = p.evaluate('window.__eqItem')
        if i == 0: shot(p, size, 'u24-5-finder')
        if it['kind'] == 'eq-dia': ok(p.locator('.dg-gaplab').count() == 0 and p.locator('.dg-gap.hidden').count() == 1, 'finder diagram: the gap is not named before the answer')
        if i == 0:
            st = it['steps'][0]
            if st['type'] == 'choice':
                wrongs = [o['t'] for o in st['options'] if o['v'] != st['answer']][:2]
                for t in wrongs: p.locator('#step .choice', has_text=t).first.click()
            else:
                for _ in range(2): p.fill('#num', '1'); p.click('#chk')
            ok(p.locator('text=Here is the answer').count() == 1, 'finder: answer revealed after two wrong tries')
            shot(p, size, 'u24-6-finder-reveal'); no_overflow(p, size + ' finder reveal')
        else:
            for st in it['steps']:
                if st['type'] == 'choice':
                    t = next(o['t'] for o in st['options'] if o['v'] == st['answer'])
                    p.locator('#step .choice').filter(has_text=t).first.click()
                else:
                    p.fill('#num', str(st['answer'])); p.click('#chk')
            ok(p.locator('#step .fb.ok').count() == 1, f'finder {i+1} ({it["kind"]}): solved')
            if it['kind'] == 'eq-dia': ok(p.locator('.dg-gaplab').count() == 1, 'finder diagram: the gap is named after the answer')
            if it['kind'] == 'eq-market' and not any('market' in f for f in SHOT_DONE): SHOT_DONE.add('market'); shot(p, size, 'u24-7-market')
        no_overflow(p, f'{size} finder {i+1}')
        p.click('#nx')
        if p.locator('#ok').count(): p.click('#ok')
    p.wait_for_selector('text=Equilibrium finder done'); p.wait_for_selector('#saved:has-text("Saved")')
    ok('5 / 6' in p.inner_text('main'), 'finder score 5/6'); p.click('#back'); p.wait_for_selector('.msteps')
    # Paper 1 (2.4): all right
    p.click('.msteps a[href$="/mcq"]')
    for i in range(10):
        p.wait_for_selector('.event'); q = q_on(p)
        ok(q['id'].startswith('q4-'), f'2.4 mcq {i+1} is a 2.4 question')
        p.locator('.choice').nth(right_idx(p, q)[0]).locator('b').first.click(); p.click('#nx')
    p.wait_for_selector('text=Paper 1 practice done'); ok('10 / 10' in p.inner_text('main'), '2.4 mcq 10/10'); p.click('#back'); p.wait_for_selector('.msteps')
    # Data response (2.4)
    p.click('.msteps a[href$="/data"]'); p.wait_for_selector('#qa')
    ok('Rambutan' in p.inner_text('h1'), '2.4 data response title'); shot(p, size, 'u24-8-data'); no_overflow(p, size + ' 2.4 data')
    p.fill('#qai', '40'); p.click('#qac'); ok('1/1' in p.inner_text('#qafb'), 'identify equilibrium 1/1'); p.locator('#qa button:has-text("Next")').click()
    p.fill('#qbi', '300'); p.click('#qbc'); ok('2/2' in p.inner_text('#qbfb'), 'shortage 2/2'); p.locator('#qb button:has-text("Next")').click()
    p.click('#qc .seg[data-k="p"] button[data-v="60"]')
    ok(p.locator('#qc .dg-gaplab').count() == 0 and p.locator('#qc .dg-gap.surplus').count() == 0 and p.locator('#qc .dg-gap.hidden').count() == 1,
       'price line: the gap is not named or coloured before Check')
    shot(p, size, 'u24-9a-priceline-before-check')
    p.click('#qc .seg[data-k="t"] button[data-v="surplus"]'); p.click('#qcc')
    ok('2/2' in p.inner_text('#qcfb'), 'price line 2/2')
    ok(p.locator('#qc .dg-gaplab.surplus').count() == 1, 'price line: the surplus is labelled after Check'); shot(p, size, 'u24-9-priceline'); p.locator('#qc button:has-text("Next")').click()
    p.fill('#qdi', 'At 60 there is a surplus because supply is more than demand. Sellers cut the price. Quantity demanded extends and quantity supplied contracts until equilibrium at 40.')
    p.click('#qdc'); ok('4/4' in p.inner_text('#qdfb'), 'explain 4/4'); p.locator('#qd button:has-text("Finish")').click()
    p.wait_for_selector('#saved:has-text("Saved")'); ok('9 / 9' in p.inner_text('main'), '2.4 data 9/9')
    p.click('#back'); p.wait_for_selector('.msteps'); ok(p.locator('.msteps li.done').count() >= 4, '2.4: mission steps done')
    p.goto(BASE + '/learn/?demo=1#/units'); p.wait_for_selector('.ulist'); ok('Mission' in p.inner_text('a.urow[href="#/u/2.4"]'), 'units page shows 2.4 mission progress')
    p.click('#out'); p.wait_for_selector('#f')

def run_teacher(p, size):
    p.goto(BASE + '/learn/teacher.html?demo=1'); p.wait_for_selector('#f')
    p.fill('#u', 'teacher'); p.fill('#p', 'demo'); p.click('#f button'); p.wait_for_selector('table.grid')
    ok('An' in p.inner_text('table.grid'), 'teacher sees the student'); ok('XP WEEK' in p.inner_text('table.grid').upper(), 'XP columns')
    ok(p.locator('.stats .stat').count() == 4, 'four stat cards')
    ok('Needs help in 2.5 (1)' in p.inner_text('main') and 'needs help' in p.inner_text('table.grid'), 'struggling student flagged'); shot(p, size, 't1-progress'); no_overflow(p, size + ' teacher progress')
    p.click('[data-unit="2.4"]'); p.wait_for_selector('table.grid'); ok('MISSION' in p.inner_text('table.grid').upper() and 'Mia' in p.inner_text('table.grid'), 'teacher: 2.4 student table')
    p.click('[data-tab="traps"]'); ok('What equilibrium means' in p.inner_text('main'), 'teacher: 2.4 misconceptions'); shot(p, size, 't7-u24-traps')
    p.click('[data-tab="items"]'); ok('Finder' in p.inner_text('main'), 'teacher: 2.4 hardest questions list finder kinds'); shot(p, size, 't8-u24-items')
    p.click('[data-unit="2.5"]'); p.click('[data-tab="students"]'); p.wait_for_selector('table.grid')
    p.click('[data-tab="traps"]'); p.wait_for_selector('text=Reteach first'); shot(p, size, 't2-traps'); no_overflow(p, size + ' teacher traps')
    p.click('[data-tab="items"]'); p.wait_for_selector('text=hardest first'); shot(p, size, 't3-items'); no_overflow(p, size + ' teacher items')
    p.click('[data-tab="students"]'); p.locator('a.sname').first.click(); p.wait_for_selector('details.card')
    ok(p.locator('.msteps').count() == 9, 'student tracker: a mission card for each built unit')
    p.click('#bk'); p.click('[data-tab="leaderboard"]'); p.wait_for_selector('table.lb'); ok(p.locator('table.lb tr').count() >= 3, 'teacher leaderboard'); shot(p, size, 't4b-leaderboard')
    p.click('[data-tab="students"]'); p.locator('a.sname').first.click(); p.wait_for_selector('details.card')
    p.locator('details.card').first.locator('summary').click(); shot(p, size, 't4-student'); no_overflow(p, size + ' teacher student')
    p.click('#bk'); p.click('[data-tab="manage"]'); p.wait_for_selector('#paste')
    btn = p.locator('tr[data-row] [data-act="pin"]').nth(1); btn.click(); ok('again' in btn.inner_text(), 'reset PIN asks twice'); btn.click()
    p.wait_for_selector('#slips'); ok(re.search(r'PIN \d{4}', p.inner_text('#slips')) is not None, 'new PIN shown')
    p.click('#cl')
    p.fill('#paste', 'Nguyễn Văn Test\tTester\nTRẦN THỊ BÌNH'); ok('Bình' in p.inner_text('#prev'), 'roster preview')
    p.click('#add'); p.wait_for_selector('#slips'); ok('demo-05' in p.inner_text('#slips'), 'new usernames continue numbering')
    shot(p, size, 't5-manage'); no_overflow(p, size + ' teacher manage'); p.click('#cl')
    p.click('[data-tab="units"]'); p.check('input[value="2.6"]'); p.click('#save'); p.wait_for_timeout(300)
    ok('2.6' in p.inner_text('.dash-head'), 'units saved'); shot(p, size, 't6-units')
    ok('Live' in p.inner_text('#live') and 'off' not in p.inner_text('#live'), 'live refresh on by default')
    p.click('[data-tab="manage"]'); p.wait_for_selector('#board'); p.uncheck('#board'); p.wait_for_timeout(300)
    p.click('#out'); p.wait_for_selector('#f')
    # the student now sees 2.6 as open but "coming soon"
    p.goto(BASE + '/learn/?demo=1'); p.wait_for_selector('#f'); p.fill('#u', 'demo-03'); p.fill('#p', '1234'); p.click('#f button')
    p.wait_for_selector('.hero h1'); p.goto(BASE + '/learn/?demo=1#/units'); p.wait_for_selector('.ulist'); ok('Coming soon' in p.inner_text('.ulist'), 'opened-but-unbuilt unit shows Coming soon')
    p.goto(BASE + '/learn/?demo=1#/me/leaderboard'); p.wait_for_selector('#lb .panel'); ok('turned the class leaderboard off' in p.inner_text('#lb'), 'leaderboard hidden when the teacher turns it off')

with sync_playwright() as pw:
    b = pw.chromium.launch()
    for size, (w, h) in SIZES.items():
        print('==', size)
        ctx = b.new_context(viewport={'width': w, 'height': h}, has_touch=size != 'laptop', is_mobile=size == 'phone')
        p = ctx.new_page(); errs = []; p.add_init_script(CEL)
        p.on('pageerror', lambda e: errs.append(str(e))); p.on('console', lambda m: m.type == 'error' and errs.append(m.text))
        try:
            run_student(p, size); run_struggler(p, size); run_u24(p, size); run_teacher(p, size)
        except Exception as e:
            fails.append(f'{size}: crashed: {e}'); print('  CRASH', e); p.screenshot(path=f'{SHOTS}/{size}-CRASH.png')
        ok(not [e for e in errs if 'fonts.g' not in e and 'ERR_TUNNEL' not in e], f'{size}: console errors {errs[:3]}')
        ctx.close()
    b.close()
print(f'{checks - len(fails)}/{checks} checks passed'); sys.exit(1 if fails else 0)
