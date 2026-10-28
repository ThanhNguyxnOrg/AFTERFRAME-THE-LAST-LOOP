import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
from phase13_1_browser import Audit, REAL, FIXTURE, check


def touch_hold(a, test_id, condition, cancel=False):
    box = a.page.get_by_test_id(test_id).bounding_box()
    assert box
    cdp = a.context.new_cdp_session(a.page)
    point = {'x':box['x']+box['width']/2,'y':box['y']+box['height']/2,'id':1}
    cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[point]})
    try:
        a.wait(condition)
    finally:
        cdp.send('Input.dispatchTouchEvent',{'type':'touchCancel' if cancel else 'touchEnd','touchPoints':[]})
        cdp.detach()


def layout(a, ids):
    return a.page.evaluate('''ids => {
      const rects=ids.map(id=>{const el=document.querySelector(`[data-testid="${id}"]`),r=el.getBoundingClientRect();
        return {id,x:r.x,y:r.y,w:r.width,h:r.height,visible:r.width>0&&r.height>0,
          onScreen:r.x>=0&&r.y>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1};});
      const overlaps=[];
      for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++) {
        const a=rects[i],b=rects[j];
        if(Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)>1 && Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)>1)overlaps.push([a.id,b.id]);
      }
      return {rects,overlaps,overflow:document.documentElement.scrollWidth>innerWidth,scrollX,scrollY};
    }''',ids)


def mobile(a):
    p=a.page
    p.get_by_test_id('title-btn-new-run').tap()
    p.get_by_test_id('btn-skip-intro').tap()
    a.wait("w.run.stage==='calibration'")
    def move():
        before=a.value('w.player.x')
        touch_hold(a,'touch-move-left',f'w.player.x < ({before})-.7')
        a.wait('w.player.vx===0 && w.player.vz===0')
        stopped=a.value('({x:w.player.x,z:w.player.z,t:w.elapsedTime})')
        a.wait(f"w.elapsedTime > {stopped['t']}+.35")
        assert abs(a.value('w.player.x')-stopped['x'])<.01
        assert p.evaluate('scrollY')==0
        return {'startX':before,'released':stopped,'touchType':'CDP trusted touchStart/touchEnd'}
    a.step('touch movement hold release and no scroll',move)
    def cancel():
        before=a.value('w.player.x')
        touch_hold(a,'touch-move-left',f'w.player.x < ({before})-.4',cancel=True)
        a.wait('w.player.vx===0 && w.player.vz===0')
        return {'touchType':'CDP touchCancel','stopped':True}
    a.step('touch cancellation releases movement',cancel)
    for control, action in [('light','light'),('heavy','heavy'),('parry','parry'),('dodge','dodg')]:
        def tap_action(control=control,action=action):
            a.idle()
            marker=p.evaluate('auditStates.length')
            p.get_by_test_id(f'combat-btn-{control}').tap()
            p.wait_for_function('([n,s])=>auditStates.slice(n).some(e=>e.state.startsWith(s))',arg=[marker,action])
            return {'control':control,'trustedTouch':True}
        a.step(f'touch {control}',tap_action)
    def echo():
        a.idle()
        p.get_by_test_id('echo-btn-record').tap()
        a.wait("w.echo.state==='recording' && w.echo.recordingTime>.6")
        p.get_by_test_id('echo-btn-record').tap()
        a.wait("w.echo.state==='ready'")
        p.get_by_test_id('echo-btn-replay').tap()
        a.wait("w.echo.state==='playback'")
    a.step('touch Echo record stop replay',echo)
    def pause():
        p.get_by_test_id('hud-btn-pause').tap()
        a.wait("w.appState==='paused'")
        before=a.value('({t:w.elapsedTime,x:w.player.x,z:w.player.z,hp:w.player.integrity})')
        p.get_by_test_id('status-modal').tap(position={'x':15,'y':15})
        after=a.value('({t:w.elapsedTime,x:w.player.x,z:w.player.z,hp:w.player.integrity})')
        assert before==after
        assert p.evaluate('__afterframeTest.getInput().leftMouseDown') is False
        p.get_by_test_id('modal-btn-resume').tap()
        a.wait("w.appState==='playing'")
    a.step('touch pause resume and overlay input isolation',pause)
    def boss():
        p.evaluate('__afterframeTest.startBossEncounter(true)')
        p.get_by_test_id('boss-hud').wait_for(state='visible')
        ids=['boss-hud','touch-move-pad','combat-btn-light','combat-btn-heavy','echo-btn-record','hud-btn-pause']
        result=layout(a,ids)
        assert not result['overflow'],result
        assert not result['overlaps'],result
        assert all(r['onScreen'] for r in result['rects']),result
        a.screenshot(f"mobile-{a.report['viewport']['width']}.png")
        return result
    a.step('boss HUD and touch control spacing',boss,FIXTURE,'Existing API starts HELIX to inspect mobile layout.')
    def defeat():
        a.wait("w.appState==='gameover' && w.outcome==='defeat'",timeout=120000)
        p.get_by_test_id('modal-btn-restart').tap()
        a.wait("w.appState==='playing' && w.player.integrity>0")
    a.step('touch defeat result and retry',defeat,FIXTURE,'Practice boss initialized by prior fixture; defeat occurs naturally; retry uses touch.')
    a.report['steps'].append({'name':'touch camera drag','status':'not_tested','reason':'InputController has mouse camera handlers only; no touch orbit contract or touch camera control is implemented.'})
    a.report['steps'].append({'name':'physical phone/tablet','status':'not_tested','reason':'Desktop Chromium touch emulation only; no physical device connected or used.'})


def camera_samples(p):
    return p.evaluate('''() => new Promise(resolve=>{
      const renderer=auditObjects.find(o=>o.isWebGLRenderer), original=renderer.render, positions=[];
      renderer.render=function(scene,camera){positions.push(camera.position.toArray());
        const result=original.call(this,scene,camera);
        if(positions.length===16){renderer.render=original;resolve(positions)}return result;};
    })''')


def settings(a):
    p=a.page
    def defaults():
        assert p.evaluate('__afterframeTest.getInput().getCameraSettings().reducedMotion') is False
        p.emulate_media(reduced_motion='reduce')
        p.reload()
        p.wait_for_function("document.body.dataset.reducedMotion==='true'")
        p.get_by_test_id('title-btn-controls').click()
        button=p.get_by_test_id('title-setting-reduced-motion')
        assert button.get_attribute('aria-pressed')=='true'
        button.focus()
        button.press('Space')
        p.wait_for_function("document.body.dataset.reducedMotion==='false'")
        assert a.value('w.appState')=='title'
        p.reload()
        p.wait_for_function("document.body.dataset.reducedMotion==='false'")
        return {'osReduce':True,'explicitFalseSurvivesReload':True,'keyboardToggleDoesNotLaunch':True}
    a.step('OS default keyboard override and persistence',defaults)
    def paused():
        p.get_by_test_id('title-btn-new-run').click()
        p.get_by_test_id('btn-skip-intro').click()
        p.get_by_test_id('hud-btn-pause').click()
        button=p.get_by_test_id('modal-setting-reduced-motion')
        assert button.get_attribute('aria-pressed')=='false'
        p.evaluate('__afterframeTest.getWorld().cameraTrauma=1')
        before=a.value('JSON.stringify(w)')
        normal=camera_samples(p)
        button.click()
        p.wait_for_function("document.body.dataset.reducedMotion==='true'")
        reduced=camera_samples(p)
        after=a.value('JSON.stringify(w)')
        assert before==after
        normal_range=max(v[0] for v in normal)-min(v[0] for v in normal)
        reduced_range=max(v[0] for v in reduced)-min(v[0] for v in reduced)
        assert normal_range>.05 and reduced_range<1e-8,(normal_range,reduced_range)
        animated=p.evaluate("getComputedStyle(document.querySelector('.animate-pulse')).animationName")
        assert animated=='none'
        a.screenshot('reduced-motion-settings.png')
        p.get_by_test_id('modal-btn-resume').click()
        p.get_by_test_id('hud-btn-pause').click()
        p.get_by_test_id('modal-btn-title').click()
        p.get_by_test_id('title-btn-controls').click()
        assert p.get_by_test_id('title-setting-reduced-motion').get_attribute('aria-pressed')=='true'
        return {'normalCameraXRange':normal_range,'reducedCameraXRange':reduced_range,'worldUnchanged':True,'pulseAnimation':animated}
    a.step('pause/title synchronization actual camera shake and CSS',paused,FIXTURE,'Set paused world.cameraTrauma=1 to measure render presentation; no simulation advance or combat timing mutation.')


def assets(a):
    p=a.page
    p.wait_for_function("auditObjects.some(o=>{let n=0;o.traverse?.(x=>{if(x.name.startsWith('BlenderAsset_'))n++});return n===4})")
    def inspect():
        return p.evaluate('''() => {
          const scene=auditObjects.find(o=>o.isScene&&o.children.length>10), assets=[];
          scene.traverse(o=>{if(o.name.startsWith('BlenderAsset_'))assets.push({name:o.name,uuid:o.uuid,visible:o.parent.visible,meshes:o.children.length});});
          return {assets,requests:performance.getEntriesByType('resource').filter(r=>r.name.endsWith('.glb')).map(r=>({url:r.name,status:r.responseStatus,size:r.decodedBodySize}))};
        }''')
    before=inspect()
    assert len(before['assets'])==4
    assert len(before['requests'])==4
    assert all(r['status']==200 and r['size']>0 for r in before['requests'])
    identities=sorted(x['uuid'] for x in before['assets'])
    for boss,chapter in [('helix-04','chapter_1_helix'),('the-choir','chapter_2_choir'),('the-curator','chapter_3_curator'),('matron-v','chapter_4_matron')]*2:
        def switch(boss=boss,chapter=chapter):
            p.evaluate('id=>__afterframeTest.startBossEncounter(true,id)',boss)
            a.wait(f"w.run.chapter==='{chapter}'")
            result=inspect()
            assert sorted(x['uuid'] for x in result['assets'])==identities
            assert len(result['requests'])==4
            assert [x['name'] for x in result['assets'] if x['visible']]==[f'BlenderAsset_{chapter}']
            return result
        a.step(f'{chapter} loaded visible and not duplicated',switch,FIXTURE,'Existing startBossEncounter fixture selects chapter; real GLTF network/load/render objects inspected.')


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--url',default='http://127.0.0.1:4173')
    parser.add_argument('--out',default='screenshots/phase13-1')
    parser.add_argument('--suite',choices=['mobile','settings','assets'],required=True)
    args=parser.parse_args()
    out=Path(args.out);out.mkdir(parents=True,exist_ok=True)
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=['--use-angle=d3d11'],timeout=15000)
        sizes=[(390,844),(430,932)] if args.suite=='mobile' else [(1440,900)]
        try:
            for width,height in sizes:
                a=Audit(browser,args.url,out,{'width':width,'height':height},mobile=args.suite=='mobile')
                try:
                    {'mobile':mobile,'settings':settings,'assets':assets}[args.suite](a)
                    assert not a.report['errors'],a.report['errors']
                finally:
                    a.close(f'{args.suite}-{width}.json')
        finally:
            browser.close()


if __name__=='__main__':
    main()
