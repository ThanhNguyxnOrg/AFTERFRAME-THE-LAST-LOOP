import argparse
import gzip
import json
import platform
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

INIT = """(() => {
  Object.defineProperty(navigator, 'webdriver', {get: () => false});
  window.__THREE_DEVTOOLS__ = new EventTarget();
  window.auditObjects = [];
  __THREE_DEVTOOLS__.addEventListener('observe', e => auditObjects.push(e.detail));
})()"""

MEASURE = """async ({duration, warmup}) => {
  const w = __afterframeTest.getWorld();
  const renderer = auditObjects.find(o => o.isWebGLRenderer);
  const scene = auditObjects.find(o => o.isScene && o.children.length > 10);
  const gl = renderer.getContext(), ext = gl.getExtension('WEBGL_debug_renderer_info');
  const frames = [], tasks = [], phases = [];
  const observer = new PerformanceObserver(list => {
    for (const e of list.getEntries()) tasks.push({start: e.startTime, duration: e.duration});
  });
  observer.observe({type: 'longtask'});
  const start = performance.now();
  let prev = null, lastPhase = '', latestRenderMs = 0;
  const render = renderer.render;
  renderer.render = function(...args) {
    const t = performance.now(); const result = render.apply(this, args);
    latestRenderMs = performance.now() - t; return result;
  };
  await new Promise(resolve => {
    function frame(now) {
      const phase = `${w.boss?.phase}:${w.boss?.aiState}:${w.boss?.activeAttack}`;
      if (phase !== lastPhase) { phases.push({at: now, phase}); lastPhase = phase; }
      if (prev !== null) frames.push({at: now, ms: now-prev, phase,
        renderMs: latestRenderMs, calls: renderer.info.render.calls,
        geometries: renderer.info.memory.geometries, programs: renderer.info.programs.length,
        heap: performance.memory?.usedJSHeapSize, trauma: w.cameraTrauma,
        events: w.events.map(e=>e.type), state:w.appState});
      prev = now;
      if (now-start < duration) requestAnimationFrame(frame); else resolve();
    }
    requestAnimationFrame(frame);
  });
  renderer.render = render;
  tasks.push(...observer.takeRecords().map(e=>({start:e.startTime,duration:e.duration})));
  observer.disconnect();
  const sorted = frames.map(f=>f.ms).sort((a,b)=>a-b);
  const percentile = q => sorted[Math.floor((sorted.length-1)*q)];
  const assets = []; scene.traverse(o=>{if(o.name.startsWith('BlenderAsset_')) assets.push(o.name)});
  return {start, durationMs:prev-start, samples:frames.length, warmup,
    meanMs:sorted.reduce((a,b)=>a+b,0)/sorted.length, p50Ms:percentile(.5),
    p95Ms:percentile(.95), maxMs:sorted.at(-1), longTasks:tasks, phases,
    longFrames:frames.filter(f=>f.ms>=50), frames, assets,
    graphics:ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
    dpr:renderer.getPixelRatio(), antialias:gl.getContextAttributes().antialias,
    userAgent:navigator.userAgent, webdriver:navigator.webdriver};
}"""


def trace_summary(events, start_ts, end_ts):
    relevant = [e for e in events if start_ts <= e.get('ts', 0) <= end_ts]
    spans = [e for e in relevant if e.get('ph') == 'X' and e.get('dur', 0) >= 1000]
    names = ('RunTask', 'FunctionCall', 'MinorGC', 'MajorGC', 'V8.GC', 'Compile', 'Program', 'FireAnimationFrame', 'UpdateLayoutTree', 'Layout', 'Resource')
    top = sorted((e for e in spans if any(n in e.get('name', '') for n in names)), key=lambda e: e['dur'], reverse=True)[:30]
    return [{k: e[k] for k in ('name', 'ts', 'dur', 'pid', 'tid', 'args') if k in e} for e in top]


def main():
    parser = argparse.ArgumentParser(description='Repeat warmed HELIX frame measurements in an isolated Chromium context.')
    parser.add_argument('--url', default='http://127.0.0.1:4173')
    parser.add_argument('--out', required=True)
    parser.add_argument('--runs', type=int, default=5)
    parser.add_argument('--duration', type=int, default=6000)
    args = parser.parse_args()
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    report = {'machine': platform.platform(), 'viewport': {'width':1440,'height':900},
              'fixture': 'Existing test API starts HELIX and forces vector_ram; no input during sampling. Fresh isolated context; all 4 GLBs loaded. Full renderer path via webdriver=false and non-Headless UA.',
              'warmup': 'Initial HELIX vector_ram: 6000ms rendered. Each run restarts HELIX, renders 1500ms, then forces vector_ram before 6000ms capture.',
              'runs': [], 'errors': []}
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=['--use-angle=d3d11'], timeout=15000)
        report['browser'] = browser.version
        context = browser.new_context(viewport=report['viewport'], device_scale_factor=1,
                                      user_agent=f'Mozilla/5.0 Chrome/{browser.version} Safari/537.36')
        context.add_init_script(INIT)
        page = context.new_page()
        page.on('pageerror', lambda e: report['errors'].append(str(e)))
        page.on('console', lambda m: report['errors'].append(m.text) if m.type == 'error' else None)
        page.goto(args.url)
        page.wait_for_load_state('networkidle')
        page.wait_for_function("auditObjects.some(o => {let n=0; o.traverse?.(x=>{if(x.name.startsWith('BlenderAsset_'))n++});return n===4})")
        page.evaluate("__afterframeTest.startBossEncounter(true); __afterframeTest.forceBossAttack('vector_ram')")
        report['initialWarmup'] = page.evaluate(MEASURE, {'duration':6000,'warmup':True})
        for index in range(args.runs):
            page.evaluate('__afterframeTest.startBossEncounter(true)')
            page.evaluate(MEASURE, {'duration':1500,'warmup':True})
            cdp = context.new_cdp_session(page)
            chunks = []
            finished = []
            cdp.on('Tracing.dataCollected', lambda data: chunks.extend(data['value']))
            cdp.on('Tracing.tracingComplete', lambda data: finished.append(True))
            cdp.send('Tracing.start', {'categories':'devtools.timeline,v8,blink.user_timing,disabled-by-default-devtools.timeline,disabled-by-default-v8.gc', 'transferMode':'ReportEvents'})
            page.evaluate("__afterframeTest.forceBossAttack('vector_ram')")
            result = page.evaluate(MEASURE, {'duration':args.duration,'warmup':False})
            cdp.send('Tracing.end')
            deadline = time.monotonic() + 15
            while not finished:
                if time.monotonic() > deadline:
                    raise TimeoutError('Chromium trace did not complete within 15 seconds')
                cdp.send('Runtime.evaluate', {'expression':'1'})
            spans = [e for e in chunks if e.get('ph') == 'X' and e.get('dur',0)>0]
            if spans:
                result['traceLongestTasks'] = trace_summary(chunks, min(e['ts'] for e in spans), max(e['ts'] for e in spans))
            with gzip.open(out / f'helix-{index+1}.trace.json.gz', 'wt', encoding='utf-8') as f:
                json.dump({'traceEvents':chunks}, f, separators=(',', ':'))
            result['trace'] = f'helix-{index+1}.trace.json.gz'
            report['runs'].append(result)
            cdp.detach()
            print(json.dumps({k:result[k] for k in ('samples','meanMs','p50Ms','p95Ms','maxMs','longTasks')}), flush=True)
        context.close()
        browser.close()
    (out / 'performance.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    assert not report['errors'], report['errors']


if __name__ == '__main__':
    main()
