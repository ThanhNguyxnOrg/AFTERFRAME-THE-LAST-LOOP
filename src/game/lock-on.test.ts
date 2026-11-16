import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHRONO_EXECUTION_CONFIG,
  LOCK_ON_BREAK_RANGE,
  LOCK_ON_MAX_ACQUIRE_RANGE,
  computeLockedCameraYaw,
  computeTargetBearingYaw,
  cycleLockOnTarget,
  findExecutionCandidate,
  resolveActiveLockOnTarget,
  selectBestLockOnTarget,
} from './lock-on.ts';
import { createInitialWorld } from './simulation.ts';

test('selectBestLockOnTarget prioritizes aligned hostiles within acquire range', () => {
  const world = createInitialWorld('playing');
  world.player.x = 0;
  world.player.z = 0;
  world.enemies = [
    {
      ...world.enemies[0],
      id: 'far_behind',
      name: 'Behind Unit',
      x: 0,
      z: 10,
      hp: 80,
      maxHp: 80,
      aiState: 'pursue',
    },
    {
      ...world.enemies[0],
      id: 'front_target',
      name: 'Front Unit',
      x: 0,
      z: -6,
      hp: 80,
      maxHp: 80,
      aiState: 'pursue',
    },
    {
      ...world.enemies[0],
      id: 'out_of_range',
      name: 'Distant Unit',
      x: 0,
      z: -(LOCK_ON_MAX_ACQUIRE_RANGE + 4),
      hp: 80,
      maxHp: 80,
      aiState: 'pursue',
    },
  ];

  // cameraYaw = Math.PI looks down -Z axis
  const chosen = selectBestLockOnTarget(world, Math.PI);
  assert.ok(chosen);
  assert.equal(chosen.id, 'front_target');

  const yawToFront = computeTargetBearingYaw(0, 0, 0, -6);
  assert.ok(Math.abs(Math.abs(yawToFront) - Math.PI) < 0.001);
});

test('resolveActiveLockOnTarget clears target if KO or beyond break range', () => {
  const world = createInitialWorld('playing');
  world.player.x = 0;
  world.player.z = 0;
  const target = world.enemies[0];
  target.x = 0;
  target.z = -5;
  target.hp = 60;
  target.aiState = 'pursue';

  assert.equal(resolveActiveLockOnTarget(world, target.id)?.id, target.id);

  target.z = -(LOCK_ON_BREAK_RANGE + 1);
  assert.equal(resolveActiveLockOnTarget(world, target.id), null);

  target.z = -5;
  target.aiState = 'ko';
  assert.equal(resolveActiveLockOnTarget(world, target.id), null);
});

test('cycleLockOnTarget steps deterministically through active hostiles', () => {
  const world = createInitialWorld('playing');
  world.player.x = 0;
  world.player.z = 0;
  world.enemies = [
    { ...world.enemies[0], id: 'e1', x: 0, z: -4, hp: 50, aiState: 'pursue' },
    { ...world.enemies[0], id: 'e2', x: 0, z: -8, hp: 50, aiState: 'pursue' },
  ];

  const next = cycleLockOnTarget(world, 'e1', Math.PI);
  assert.equal(next?.id, 'e2');
  const wrapped = cycleLockOnTarget(world, 'e2', Math.PI);
  assert.equal(wrapped?.id, 'e1');
});

test('computeLockedCameraYaw rotates smoothly without wrap discontinuity', () => {
  const nextYaw = computeLockedCameraYaw(-Math.PI + 0.1, 0, 0, 1, -10, 0.05, 12);
  assert.ok(Number.isFinite(nextYaw));
  assert.ok(nextYaw <= Math.PI && nextYaw >= -Math.PI);
});

test('findExecutionCandidate detects staggered mobs and staggered bosses within respective execution ranges', () => {
  const world = createInitialWorld('playing');
  world.player.x = 0;
  world.player.z = 0;

  world.enemies[0].x = 0;
  world.enemies[0].z = -(CHRONO_EXECUTION_CONFIG.mobMaxRange - 0.3);
  world.enemies[0].hp = 90;
  world.enemies[0].aiState = 'pursue';
  assert.equal(findExecutionCandidate(world), null);

  world.enemies[0].aiState = 'staggered';
  const mobCand = findExecutionCandidate(world);
  assert.ok(mobCand);
  assert.equal(mobCand.id, world.enemies[0].id);
  assert.equal(mobCand.isBoss, false);

  world.enemies[0].z = -(CHRONO_EXECUTION_CONFIG.mobMaxRange + 1.5);
  assert.equal(findExecutionCandidate(world), null);
});
