import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
from phase13_1_performance import INIT

WORLD = '__afterframeTest.getWorld()'
REAL = 'passed_real_input'
FIXTURE = 'passed_test_fixture'

AUDIT_INIT = INIT + """
HTMLElement.prototype.requestPointerLock = async () => { throw new DOMException('Unlocked camera audit', 'NotAllowedError'); };
window.auditWrites = [];
const setItem = Storage.prototype.setItem;
Storage.prototype.setItem = function(k,v) { auditWrites.push({key:k, value:v}); return setItem.call(this,k,v); };
window.auditStates = [];
function observe() {
  const w = window.__afterframeTest?.getWorld();
  if(w) {
    const state = `${w.player.actionState}:${w.echo.state}:${w.run.stage}`;
    if (auditStates.at(-1)?.state !== state) auditStates.push({state, at:performance.now()});
  }
  requestAnimationFrame(observe);
}
requestAnimationFrame(observe);
"""


class Audit:
    def __init__(self, browser, url, out, viewport, mobile=False):
        self.context = browser.new_context(viewport=viewport, device_scale_factor=1,
                                          is_mobile=mobile, has_touch=mobile,
                                          user_agent=browser.version and f'Mozilla/5.0 Chrome/{browser.version} Safari/537.36')
        self.context.add_init_script(AUDIT_INIT)
        self.page = self.context.new_page()
        self.page.set_default_timeout(10000)
        self.out = out
        self.report = {'browser':browser.version, 'viewport':viewport, 'deviceScaleFactor':1,
                       'physicalDevice':False, 'touch':mobile, 'url':url,
                       'startSave':'Fresh nonpersistent browser context, no imported storage; destroyed after run.',
                       'automation':'Full renderer (webdriver=false/non-Headless UA); pointer lock deliberately denied to exercise supported unlocked camera. Test API reads observe state; writes are classified fixtures.',
                       'steps':[], 'errors':[]}
        self.page.on('pageerror', lambda e: self.report['errors'].append(str(e)))
        self.page.on('console', lambda m: self.report['errors'].append(m.text) if m.type == 'error' else None)
        self.page.goto(url)
        self.page.wait_for_load_state('networkidle')
        self.page.wait_for_function('window.__afterframeTest !== undefined')

    def step(self, name, fn, classification=REAL, fixture=None):
        result = {'name':name, 'status':'failed'}
        if fixture:
            result['fixture'] = fixture
        self.report['steps'].append(result)
        try:
            details = fn()
            result['status'] = classification
            if details is not None:
                result['details'] = details
            print(f'{classification}: {name}', flush=True)
        except Exception as error:
            result['error'] = str(error)
            result['state'] = self.value('({player:w.player,run:w.run,echo:w.echo.state})')
            result['observedStates'] = self.page.evaluate('auditStates')
            self.page.screenshot(path=str(self.out / 'failure.png'))
            raise

    def value(self, expr):
        return self.page.evaluate(f'() => {{const w={WORLD}; return ({expr});}}')

    def wait(self, expr, timeout=10000):
        self.page.wait_for_function(f'() => {{const w={WORLD}; return ({expr});}}', timeout=timeout)

    def idle(self):
        self.wait("['idle','moving'].includes(w.player.actionState)")

    def key_action(self, key, action):
        self.idle()
        self.page.keyboard.down(key)
        try:
            self.wait(f"w.player.actionState.startsWith('{action}')")
            return self.value('w.player.actionState')
        finally:
            self.page.keyboard.up(key)

    def echo_record(self, duration):
        self.page.get_by_test_id('echo-btn-record').click()
        self.wait("w.echo.state === 'recording'")
        self.wait(f'w.echo.recordingTime >= {duration}')
        self.page.get_by_test_id('echo-btn-record').click()
        self.wait("w.echo.state === 'ready'")

    def move(self, axis, target, tolerance=.18):
        value = self.value(f'w.player.{axis}')
        if abs(target-value) <= tolerance:
            return
        key = ('d' if target>value else 'a') if axis == 'x' else ('s' if target>value else 'w')
        direction = 1 if target>value else -1
        self.page.keyboard.down(key)
        try:
            self.wait(f'(w.player.{axis}-({target}))*{direction} >= -{tolerance}', timeout=12000)
        finally:
            self.page.keyboard.up(key)
        return self.value('({x:w.player.x,z:w.player.z})')

    def screenshot(self, name):
        self.page.screenshot(path=str(self.out / name))

    def close(self, name):
        (self.out / name).write_text(json.dumps(self.report, indent=2), encoding='utf-8')
        self.context.close()


def campaign(a):
    p = a.page
    a.step('fresh title save', lambda: check(a.value("w.appState==='title' && w.run.completedChapters.length===0")))
    def launch():
        p.get_by_test_id('title-btn-new-run').click()
        p.get_by_test_id('campaign-intro-banner').wait_for(state='visible')
        text = p.get_by_test_id('campaign-intro-banner').inner_text()
        assert 'Sera' in text or len(text)>80
        p.get_by_test_id('btn-skip-intro').click()
        a.wait("w.run.stage==='calibration'")
        return {'transmission':text, 'understanding':'Text visibility checked, not human comprehension.'}
    a.step('new campaign and opening transmission', launch)
    a.step('keyboard movement', lambda: (a.move('x',-3.8),a.move('z',14)))
    def aim():
        yaw = p.evaluate('__afterframeTest.getInput().aimYaw')
        p.mouse.move(750,440)
        p.mouse.down(button='middle')
        p.mouse.move(830,440,steps=8)
        p.mouse.up(button='middle')
        changed = p.evaluate('__afterframeTest.getInput().aimYaw')
        assert abs(changed-yaw)>.1
        p.mouse.down(button='middle')
        p.mouse.move(750,440,steps=8)
        p.mouse.up(button='middle')
        assert abs(p.evaluate('__afterframeTest.getInput().aimYaw')-yaw)<.001
        return {'before':yaw,'dragged':changed}
    a.step('normal mouse camera aim', aim)
    for key, action in [('f','light'),('e','heavy'),('q','parry')]:
        a.step(f'keyboard {action}', lambda k=key,s=action:a.key_action(k,s))
    def charge():
        a.idle()
        p.mouse.move(750,440)
        p.mouse.down()
        a.wait("w.player.actionState==='charging_heavy' && w.player.chargeTime>.55")
        p.mouse.up()
        a.wait("w.player.actionState.startsWith('heavy')")
        return a.value('w.player.actionState')
    a.step('mouse heavy hold and release', charge)
    # Space can acknowledge a transmission before dodging; dismiss the visible transmission first.
    if p.get_by_test_id('btn-dismiss-comms').is_visible():
        p.get_by_test_id('btn-dismiss-comms').click()
    a.step('dodge', lambda:a.key_action('Space','dodg'))
    a.idle()
    a.step('reach Pad 01 using WASD', lambda:(a.move('x',-3.8),a.move('z',9)))
    def first_echo():
        a.echo_record(3)
        p.get_by_test_id('echo-btn-replay').click()
        a.wait('w.puzzle.teachPlate.active && w.puzzle.teachPlate.barrierOpen')
        return a.value('({echo:w.echo.state,padActive:w.puzzle.teachPlate.active})')
    a.step('record stop replay and activate Pad 01', first_echo)
    a.step('cross first gate using WASD', lambda:a.move('x',-8.2))
    a.step('reach Kinetic Receiver target', lambda:a.move('z',12.4))
    def combined_echo():
        a.idle()
        p.get_by_test_id('echo-btn-record').click()
        a.wait("w.echo.state==='recording'")
        a.key_action('e','heavy')
        a.idle()
        a.move('z',10.2)
        a.wait('w.echo.recordingTime>=4.5')
        p.get_by_test_id('echo-btn-record').click()
        a.wait("w.echo.state==='ready'")
        p.get_by_test_id('echo-btn-replay').click()
        a.wait('w.puzzle.heavyReceiver.charged && w.puzzle.combinePlate.active && w.puzzle.finalBarrier.open')
        return a.value('({test:w.puzzle.testCompleted,combine:w.puzzle.combinePlate.active,gate:w.puzzle.finalBarrier.open})')
    a.step('Echo Heavy receiver plus Pad 02 opens final gate', combined_echo)
    def cross_final():
        p.keyboard.down('a')
        try:
            a.wait("w.run.stage==='transition_to_boss'")
        finally:
            p.keyboard.up('a')
        return a.value('({completed:w.puzzle.completed,checkpoint:w.run.bossCheckpoint})')
    a.step('cross final gate and trigger containment transition', cross_final)
    def boss_entry():
        a.wait("w.encounterMode==='boss' && w.boss.id==='helix-04'")
        if p.get_by_test_id('btn-skip-boss-intro').is_visible():
            p.get_by_test_id('btn-skip-boss-intro').click()
        a.wait("w.run.stage==='boss_fight'")
        p.get_by_test_id('boss-hud').wait_for(state='visible')
        a.screenshot('real-first-encounter.png')
        return a.value('({chapter:w.run.chapter,hp:w.boss.hp})')
    a.step('uninterrupted calibration to first encounter', boss_entry)
    def pause():
        p.get_by_test_id('hud-btn-pause').click()
        a.wait("w.appState==='paused'")
        before = a.value('w.elapsedTime')
        p.evaluate('() => new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
        assert a.value('w.elapsedTime') == before
        p.get_by_test_id('modal-btn-resume').click()
        a.wait("w.appState==='playing'")
    a.step('pause and resume', pause)
    def defeat():
        a.wait("w.appState==='gameover' && w.outcome==='defeat'", timeout=120000)
        p.get_by_test_id('modal-btn-retry-boss').wait_for(state='visible')
        checkpoint = a.value('w.run.bossCheckpoint')
        p.get_by_test_id('modal-btn-retry-boss').click()
        a.wait("w.appState==='playing' && w.player.integrity>0")
        return {'checkpoint':checkpoint,'retryIntegrity':a.value('w.player.integrity')}
    a.step('natural defeat and UI checkpoint retry', defeat)
    def restore():
        p.get_by_test_id('hud-btn-pause').click()
        p.get_by_test_id('modal-btn-title').click()
        p.get_by_test_id('title-btn-restore-campaign').click()
        a.wait("w.encounterMode==='boss' && w.run.chapter==='chapter_1_helix'")
    a.step('Return to Title and Continue Campaign checkpoint recovery', restore)
    a.report['steps'].append({'name':'all bosses defeated with normal input through epilogue','status':'not_tested',
                              'reason':'Real-input coverage stops at first boss/retry; subsequent progression has explicit terminal-health fixtures.'})
    assisted_progression(a)


def assisted_progression(a):
    p = a.page
    for boss_id, next_chapter in [('helix-04','chapter_2_choir'),('the-choir','chapter_3_curator'),('the-curator','chapter_4_matron'),('matron-v','chapter_5_loom')]:
        def advance(boss_id=boss_id, next_chapter=next_chapter):
            a.wait(f"w.boss?.id==='{boss_id}'")
            if p.get_by_test_id('btn-skip-boss-intro').is_visible():
                p.get_by_test_id('btn-skip-boss-intro').click()
            p.evaluate("() => {const w=__afterframeTest.getWorld(); w.boss.hp=0; w.enemies.forEach(e=>e.hp=0);}")
            a.wait("w.appState==='gameover' && w.outcome==='victory'")
            p.get_by_test_id('modal-btn-next-chapter').click()
            a.wait(f"w.run.chapter==='{next_chapter}' && w.appState==='playing'")
            return a.value('({chapter:w.run.chapter,completed:w.run.completedChapters})')
        a.step(f'{boss_id} victory modal and next chapter', advance, FIXTURE,
               'Set current boss/enemy HP=0 via existing getWorld; real UI next-chapter click. Not a player-earned victory; no campaign completion mutation.')
    for ending in ['silence','witness','continuity']:
        def select(ending=ending):
            a.wait('w.loom.active && w.loom.endingChoiceAvailable')
            p.get_by_test_id(f'loom-ending-{ending}').click()
            p.get_by_test_id('modal-ending-summary').wait_for(state='visible')
            assert a.value('w.run.selectedEnding') == ending
            assert ending in a.value('w.run.completedEndings')
            text = p.get_by_test_id('modal-ending-dialogue').inner_text()
            assert len(text)>50
            if ending=='witness':
                a.screenshot('assisted-epilogue.png')
            p.get_by_test_id('modal-btn-title').click()
            p.reload()
            p.get_by_test_id('title-nav-chapters').click()
            p.get_by_test_id(f'title-ending-badge-{ending}').wait_for(state='visible')
            snapshot = p.evaluate("localStorage.getItem('afterframe_campaign_progress_v1')")
            p.get_by_test_id('title-chapter-chapter_5_loom').click()
            a.wait('w.loom.active && w.loom.endingChoiceAvailable')
            assert a.value('w.run.isChapterReplay')
            return {'epilogueText':text,'persistedSave':json.loads(snapshot)}
        a.step(f'{ending} choice epilogue persistence and replay', select, FIXTURE,
               'Campaign reached Loom through the preceding terminal-health fixtures; choice/title/reload/replay use UI only.')
    def replay_isolation():
        p.get_by_test_id('btn-toggle-loom-chamber').click()
        p.get_by_test_id('hud-btn-pause').click()
        p.get_by_test_id('modal-btn-title').click()
        p.get_by_test_id('title-nav-chapters').click()
        before = p.evaluate("localStorage.getItem('afterframe_campaign_progress_v1')")
        p.get_by_test_id('title-chapter-chapter_1_helix').click()
        a.wait('w.run.isChapterReplay')
        p.get_by_test_id('hud-btn-pause').click()
        p.get_by_test_id('modal-btn-title').click()
        after = p.evaluate("localStorage.getItem('afterframe_campaign_progress_v1')")
        assert json.loads(before)==json.loads(after)
        return {'savedCampaignUnchanged':True}
    a.step('earlier chapter replay does not overwrite ending save', replay_isolation, FIXTURE,
           'Reuses fixture-assisted completed campaign; subsequent actions are UI.')


def check(value):
    assert value
    return value


def regressions(a):
    p = a.page
    def hover():
        p.evaluate('__afterframeTest.startPracticeStandardRun()')
        yaw = p.evaluate('__afterframeTest.getInput().aimYaw')
        p.mouse.move(700,420)
        p.mouse.move(900,450,steps=10)
        assert p.evaluate('__afterframeTest.getInput().aimYaw')==yaw
    a.step('Phase13 unlocked hover leaves yaw unchanged', hover, FIXTURE,'startPracticeStandardRun isolates controls')
    def drag_cancel():
        p.mouse.move(760,450)
        p.mouse.down()
        a.wait("w.player.actionState==='charging_heavy'")
        marker = p.evaluate('auditStates.length')
        p.mouse.move(840,450,steps=10)
        p.mouse.up()
        a.wait("w.player.actionState==='idle'")
        p.evaluate('() => new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
        states = p.evaluate('n=>auditStates.slice(n)',marker)
        assert not any('light_' in e['state'] or 'heavy_' in e['state'] for e in states)
        return states
    a.step('Phase13 camera drag cancels charge without attack',drag_cancel,FIXTURE,'Same isolated practice fixture; normal mouse input')
    def ui_click():
        a.idle()
        panel=p.get_by_test_id('tutorial-prompt-banner')
        panel.click(position={'x':10,'y':10})
        assert p.evaluate('__afterframeTest.getInput().leftMouseDown') is False
        assert a.value('w.player.actionState')=='idle'
    a.step('Phase13 pointer-interactive panel blocks gameplay click',ui_click,FIXTURE,'Same practice fixture')
    def writes():
        p.get_by_test_id('hud-btn-pause').click()
        start=p.evaluate("auditWrites.filter(w=>w.key==='afterframe_campaign_progress_v1').length")
        p.evaluate('() => new Promise(resolve=>{const t=performance.now();function f(){if(performance.now()-t>=2000)resolve();else requestAnimationFrame(f)}f()})')
        end=p.evaluate("auditWrites.filter(w=>w.key==='afterframe_campaign_progress_v1').length")
        assert end==start
        return {'durationMs':2000,'redundantWrites':end-start}
    a.step('Phase13 unchanged progress avoids storage writes',writes,FIXTURE,'Paused practice fixture; observe unchanged save over 2s')


def main():
    parser=argparse.ArgumentParser(description='Real-input campaign and explicitly assisted progression audit.')
    parser.add_argument('--url',default='http://127.0.0.1:3000')
    parser.add_argument('--out',default='screenshots/phase13-1')
    parser.add_argument('--suite',choices=['campaign','regression'],default='campaign')
    args=parser.parse_args()
    out=Path(args.out); out.mkdir(parents=True,exist_ok=True)
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=['--use-angle=d3d11'],timeout=15000)
        a=Audit(browser,args.url,out,{'width':1440,'height':900})
        try:
            (campaign if args.suite=='campaign' else regressions)(a)
            assert not a.report['errors'],a.report['errors']
        finally:
            a.close(f'{args.suite}.json')
            browser.close()


if __name__=='__main__':
    main()
