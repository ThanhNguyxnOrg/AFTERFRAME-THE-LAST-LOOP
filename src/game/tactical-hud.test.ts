import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computePeripheralThreats,
  computeRelativeBearingDeg,
  formatCombatCallouts,
  projectNdcToViewport,
} from './tactical-hud.ts';

test('computeRelativeBearingDeg matches Three.js camera forward & right conventions across cardinals', () => {
  const player = { x: 0, z: 0 };
  const aimYaw = Math.PI; // Default camera faces North (-Z)

  assert.ok(Math.abs(computeRelativeBearingDeg(0, 0, 0, -5, aimYaw)) < 0.01);
  assert.ok(Math.abs(computeRelativeBearingDeg(0, 0, 5, 0, aimYaw) - 90) < 0.01);
  assert.ok(Math.abs(computeRelativeBearingDeg(0, 0, -5, 0, aimYaw) + 90) < 0.01);
  assert.ok(Math.abs(Math.abs(computeRelativeBearingDeg(0, 0, 0, 5, aimYaw)) - 180) < 0.01);

  // Rotate camera 90° clockwise (aimYaw = PI/2 -> facing +X East)
  const eastYaw = Math.PI / 2;
  assert.ok(Math.abs(computeRelativeBearingDeg(player.x, player.z, 5, 0, eastYaw)) < 0.01);
  assert.ok(Math.abs(computeRelativeBearingDeg(player.x, player.z, 0, 5, eastYaw) - 90) < 0.01);
});

test('computePeripheralThreats prioritizes urgent projectiles & telegraphing flankers while hiding in-front targets', () => {
  const player = { x: 0, z: 0 };
  const aimYaw = Math.PI; // Facing -Z

  const threats = computePeripheralThreats(
    player,
    [
      { id: 'front', x: 0, z: -6, hp: 50, aiState: 'pursue' }, // Directly in front -> ignored
      { id: 'rear-hostile', x: 0, z: 8, hp: 50, aiState: 'pursue' }, // Directly behind -> hostile
      { id: 'right-telegraph', x: 9, z: 0, hp: 50, aiState: 'telegraph' }, // Right -> telegraph
      { id: 'ko-enemy', x: -5, z: 5, hp: 0, aiState: 'ko' }, // Dead -> ignored
    ],
    { id: 'boss-1', x: -10, z: 2, hp: 300, aiState: 'attack' }, // Left-rear attacking boss -> urgent
    [
      // Approaching projectile from behind
      { id: 1, owner: 'enemy', x: 1, z: 7, vx: -1, vz: -7 },
      // Player projectile -> ignored
      { id: 2, owner: 'player', x: 2, z: 6, vx: 0, vz: 8 },
      // Enemy projectile moving away -> ignored
      { id: 3, owner: 'enemy', x: -4, z: 4, vx: -5, vz: 5 },
    ],
    aimYaw,
    4
  );

  assert.equal(threats.length, 4);
  assert.equal(threats[0].id, 'proj:1');
  assert.equal(threats[0].severity, 'urgent');
  assert.equal(threats[1].id, 'boss:boss-1');
  assert.equal(threats[1].severity, 'urgent');
  assert.equal(threats[1].isBoss, true);
  assert.equal(threats[2].id, 'enemy:right-telegraph');
  assert.equal(threats[2].severity, 'telegraph');
  assert.equal(threats[3].id, 'enemy:rear-hostile');
  assert.equal(threats[3].severity, 'hostile');
});

test('formatCombatCallouts converts combat events cleanly and projectNdcToViewport enforces [-1, 1] Z guard', () => {
  const callouts = formatCombatCallouts([
    { type: 'player_parry_success', x: 1, z: 2 },
    { type: 'player_perfect_dodge', x: 0, z: 0, amount: 18 },
    { type: 'resonance_convergence', x: -2, z: 3, amount: 112 },
    { type: 'player_hit_enemy', x: 2, z: -1, amount: 42, isCriticalOrVulnerable: true, flowKind: 'riposte' },
    { type: 'player_hit_enemy', x: 2, z: -1, amount: 9, isGuarded: true },
    { type: 'player_damaged', x: 0, z: 0, amount: 15 },
  ]);

  assert.equal(callouts.length, 6);
  assert.equal(callouts[0].text, 'PARRY! +35F');
  assert.equal(callouts[0].tone, 'parry');
  assert.equal(callouts[1].text, 'CHRONO SLIP +18F');
  assert.equal(callouts[1].tone, 'slip');
  assert.equal(callouts[2].text, 'CONVERGE! 112');
  assert.equal(callouts[2].tone, 'converge');
  assert.equal(callouts[3].text, 'RIPOSTE 42!');
  assert.equal(callouts[3].tone, 'crit');
  assert.equal(callouts[4].text, 'GUARD 9');
  assert.equal(callouts[4].tone, 'blocked');
  assert.equal(callouts[5].text, '-15');
  assert.equal(callouts[5].tone, 'hurt');

  const center = projectNdcToViewport(0, 0, 0.2, 1440, 900);
  assert.deepEqual(center, { visible: true, x: 720, y: 450 });

  const behindCam = projectNdcToViewport(0, 0, 1.05, 1440, 900);
  assert.equal(behindCam.visible, false);

  const clippedNear = projectNdcToViewport(0, 0, -1.2, 1440, 900);
  assert.equal(clippedNear.visible, false);
});
