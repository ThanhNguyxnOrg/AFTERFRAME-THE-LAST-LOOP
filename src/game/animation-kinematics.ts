/**
 * Pure, zero-allocation procedural animation kinematics helpers shared across
 * Sera Venn, Chrono Echo, all 5 Wardens (Bosses), all 10 Enemy archetypes,
 * and animated World/Sanctum/Orbital Props.
 */

export interface OrganicBreathSample {
  /** Primary vertical chest/pelvis breathing wave in [-1, 1] */
  chest: number;
  /** Secondary slower counter-harmonic weight shift / torso sway in [-1, 1] */
  sway: number;
  /** Subtle head glance / combat readiness scan in [-1, 1] */
  headScan: number;
  /** Micro weapon readiness settle wave in [-1, 1] */
  weaponFloat: number;
}

export interface SquashStretchResult {
  scaleXZ: number;
  scaleY: number;
}

export interface PropFloatSample {
  offsetY: number;
  tiltX: number;
  tiltZ: number;
  pulseScale: number;
}

/**
 * Frame-rate-independent exponential smoothing factor in [0, 1].
 * When `reducedMotion` is enabled, returns a crisp 1.0 (instant pose settle)
 * or clamped value so transitions never lag or induce vestibular drift.
 */
export function computeDampAlpha(
  lambda: number,
  dt: number,
  reducedMotion = false
): number {
  if (!Number.isFinite(dt) || dt <= 0) return 0;
  if (reducedMotion) return 1;
  const clampedLambda = Math.max(0.5, Number.isFinite(lambda) ? lambda : 16);
  const clampedDt = Math.min(0.1, dt);
  return 1 - Math.exp(-clampedLambda * clampedDt);
}

/**
 * Smoothly moves `current` toward `target` using an exponential damping factor `alpha`.
 */
export function dampScalar(current: number, target: number, alpha: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(target)) return 0;
  const a = Math.max(0, Math.min(1, Number.isFinite(alpha) ? alpha : 1));
  return current + (target - current) * a;
}

/**
 * Computes a layered, non-repeating organic breathing + weight-shift signature.
 * Uses incommensurate frequencies (1.0x, 0.53x, 0.37x, 1.47x) so characters
 * never look robotic or locked to a single metronomic sine wave.
 */
export function computeOrganicBreath(
  elapsedTime: number,
  phaseOffset = 0,
  rate = 2.35,
  reducedMotion = false
): OrganicBreathSample {
  if (reducedMotion || !Number.isFinite(elapsedTime)) {
    return { chest: 0, sway: 0, headScan: 0, weaponFloat: 0 };
  }
  const t = elapsedTime * Math.max(0.25, rate) + phaseOffset;
  const chest = Math.sin(t) * 0.72 + Math.sin(t * 2.0 + 0.6) * 0.28;
  const sway = Math.cos(t * 0.53 + 0.4) * 0.75 + Math.sin(t * 0.29) * 0.25;
  const headScan = Math.sin(t * 0.37 + 1.1) * 0.65 + Math.cos(t * 0.83) * 0.35;
  const weaponFloat = Math.sin(t * 1.47 - 0.5) * 0.6 + Math.cos(t * 0.68) * 0.4;
  return {
    chest: Math.max(-1, Math.min(1, chest)),
    sway: Math.max(-1, Math.min(1, sway)),
    headScan: Math.max(-1, Math.min(1, headScan)),
    weaponFloat: Math.max(-1, Math.min(1, weaponFloat)),
  };
}

/**
 * Volume-preserving squash-and-stretch scale factor for heavy slams, hit flinches,
 * lunges, and dodge bursts. Preserves approximate cylinder volume: scaleXZ^2 * scaleY ≈ 1.
 *
 * @param squashAmount Positive compresses vertically (slam landing, crouch, hit recoil) in [0, 1]
 * @param stretchAmount Positive elongates vertically (lunge, dodge burst, jump windup) in [0, 1]
 */
export function computeSquashStretch(
  squashAmount: number,
  stretchAmount: number,
  reducedMotion = false
): SquashStretchResult {
  if (reducedMotion) {
    return { scaleXZ: 1, scaleY: 1 };
  }
  const squash = Math.max(0, Math.min(1, Number.isFinite(squashAmount) ? squashAmount : 0));
  const stretch = Math.max(0, Math.min(1, Number.isFinite(stretchAmount) ? stretchAmount : 0));
  const netY = 1 + stretch * 0.14 - squash * 0.15;
  const clampedY = Math.max(0.82, Math.min(1.18, netY));
  const scaleXZ = 1 / Math.sqrt(clampedY);
  return { scaleXZ, scaleY: clampedY };
}

/**
 * Smooth multi-axis floating/hovering motion for world props, holograms,
 * crystals, shuttles, and beacons.
 */
export function computePropFloatMotion(
  elapsedTime: number,
  seed = 0,
  amplitudeY = 0.1,
  reducedMotion = false
): PropFloatSample {
  if (reducedMotion || !Number.isFinite(elapsedTime)) {
    return { offsetY: 0, tiltX: 0, tiltZ: 0, pulseScale: 1 };
  }
  const t = elapsedTime + seed * 1.37;
  const offsetY = (Math.sin(t * 2.15) * 0.78 + Math.sin(t * 4.3 + 0.5) * 0.22) * amplitudeY;
  const tiltX = Math.sin(t * 1.45 + 0.8) * 0.065;
  const tiltZ = Math.cos(t * 1.25 - 0.3) * 0.065;
  const pulseScale = 1 + Math.sin(t * 3.4) * 0.045;
  return { offsetY, tiltX, tiltZ, pulseScale };
}

/**
 * Rhythmic industrial hazard strobe intensity curve (sharp pulse + smooth afterglow)
 * for wall-mounted Blast Strobes and Lockdown Beacons.
 */
export function computeStrobeIntensity(
  elapsedTime: number,
  phaseOffset = 0,
  alertMultiplier = 1,
  reducedMotion = false
): number {
  if (reducedMotion || !Number.isFinite(elapsedTime)) {
    return 0.75;
  }
  const freq = 2.1 * Math.max(0.5, Math.min(3, alertMultiplier));
  const wave = 0.5 + 0.5 * Math.sin(elapsedTime * freq * Math.PI + phaseOffset);
  const sharpPulse = Math.pow(wave, 3.2);
  return 0.35 + sharpPulse * 1.45;
}

export interface DirectionalDodgeTilt {
  /** Forward/backward pitch lean in radians */
  bodyRotX: number;
  /** Lateral roll bank in radians */
  bodyRotZ: number;
  /** Torso counter-twist yaw in radians */
  torsoRotY: number;
}

/**
 * Projects world-space dodge velocity onto a character's local facing basis
 * (Three.js +Z forward = (sin(yaw), cos(yaw)), +X right = (cos(yaw), -sin(yaw)))
 * so forward dives pitch forward, backsteps lean back, and side-dashes bank laterally.
 */
export function computeDirectionalDodgeTilt(
  vx: number,
  vz: number,
  facingYaw: number,
  reducedMotion = false
): DirectionalDodgeTilt {
  if (reducedMotion || !Number.isFinite(vx) || !Number.isFinite(vz) || !Number.isFinite(facingYaw)) {
    return { bodyRotX: 0.22, bodyRotZ: 0, torsoRotY: 0 };
  }
  const speed = Math.hypot(vx, vz);
  if (speed < 0.05) {
    return { bodyRotX: 0.44, bodyRotZ: 0, torsoRotY: 0 };
  }
  const dirX = vx / speed;
  const dirZ = vz / speed;
  const fwdX = Math.sin(facingYaw);
  const fwdZ = Math.cos(facingYaw);
  const rightX = Math.cos(facingYaw);
  const rightZ = -Math.sin(facingYaw);

  const localForward = Math.max(-1, Math.min(1, dirX * fwdX + dirZ * fwdZ));
  const localRight = Math.max(-1, Math.min(1, dirX * rightX + dirZ * rightZ));

  return {
    bodyRotX: localForward >= 0 ? 0.14 + localForward * 0.38 : localForward * 0.32,
    bodyRotZ: -localRight * 0.42,
    torsoRotY: localRight * 0.28,
  };
}
