import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { performance } from 'node:perf_hooks';

assert.ok(global.gc, 'Run with node --expose-gc scripts/benchmark-visuals.mjs <baseline-ref>');
assert.ok(process.argv[2], 'Provide the pre-change git ref');
const path = 'src/game/combat-vfx.ts';
const baseline = execFileSync('git', ['show', `${process.argv[2]}:${path}`], { encoding: 'utf8' });
const current = readFileSync(new URL('../src/game/combat-vfx.ts', import.meta.url), 'utf8');
const load = (source) => import(`data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(source)).toString('base64')}`);
const versions = [await load(baseline), await load(current)];
const count = 1_000_000;
const auraInput = {
  adrenalineScore: 3, riposteActive: false, chronoSlipActive: false,
  kineticSurgeActive: false, isRecording: true, reducedMotion: false, timeSec: 0,
};
const lockInput = {
  active: true, isBoss: false, targetRadius: 0.7, isStaggered: false,
  isTelegraphing: false, isResonanceMarked: false, coreExposed: false,
  reducedMotion: false, timeSec: 0,
};

for (const [name, input] of [['computeChronoAuraVisuals', auraInput], ['computeLockOnGroundVisuals', lockInput]]) {
  for (let version = 0; version < versions.length; version++) {
    const compute = versions[version][name];
    const out = compute(input);
    for (let i = 0; i < 100_000; i++) { input.timeSec = i / 60; compute(input, out); }
    global.gc();
    let checksum = 0;
    const start = performance.now();
    for (let i = 0; i < count; i++) {
      input.timeSec = i / 60;
      const result = compute(input, out);
      checksum += result.groundAuraScale ?? result.pulseScale;
    }
    const nsPerOp = (performance.now() - start) * 1e6 / count;
    global.gc();
    const results = new Array(count);
    global.gc();
    const before = process.memoryUsage().heapUsed;
    for (let i = 0; i < count; i++) {
      input.timeSec = i / 60;
      results[i] = compute(input, out);
    }
    global.gc();
    const heapDelta = process.memoryUsage().heapUsed - before;
    if (version === 1) assert.ok(results.every((result) => result === out));
    else assert.notEqual(results[0], results[count - 1]);
    console.log(`${name} ${version === 0 ? 'before' : 'after'}: ${nsPerOp.toFixed(1)} ns/op; retained output heap ${heapDelta} bytes / ${count} calls; checksum ${checksum.toFixed(3)}`);
  }
}
