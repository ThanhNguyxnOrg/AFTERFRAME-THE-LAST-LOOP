import type {
  CameraSettings,
  CelestialAtmosphereGrade,
  FpsLimitOption,
  GameAppState,
  GraphicsPreset,
  LightingQuality,
  ParticleQuality,
  ShadowQuality,
} from './types.ts';

export interface GraphicsProfileConfig {
  renderScale: number;
  shadowQuality: ShadowQuality;
  particleQuality: ParticleQuality;
  lightingQuality: LightingQuality;
  fpsLimit: FpsLimitOption;
}

export interface ResolvedGraphicsSettings extends GraphicsProfileConfig {
  graphicsPreset: GraphicsPreset;
  showPerfHud: boolean;
  adaptiveResolution: boolean;
  celestialGrade: CelestialAtmosphereGrade;
}

export const GRAPHICS_PRESET_CONFIGS: Record<
  Exclude<GraphicsPreset, 'custom'>,
  GraphicsProfileConfig
> = {
  performance: {
    renderScale: 0.7,
    shadowQuality: 'off',
    particleQuality: 'low',
    lightingQuality: 'lite',
    fpsLimit: 0,
  },
  balanced: {
    renderScale: 0.85,
    shadowQuality: 'medium',
    particleQuality: 'medium',
    lightingQuality: 'standard',
    fpsLimit: 60,
  },
  quality: {
    renderScale: 1.0,
    shadowQuality: 'high',
    particleQuality: 'high',
    lightingQuality: 'standard',
    fpsLimit: 0,
  },
};

export const RENDER_SCALE_OPTIONS = [0.6, 0.7, 0.85, 1.0] as const;
export const FPS_LIMIT_OPTIONS: readonly FpsLimitOption[] = [0, 60, 45, 30];

export function getDefaultGraphicsSettings(): ResolvedGraphicsSettings {
  return {
    graphicsPreset: 'balanced',
    ...GRAPHICS_PRESET_CONFIGS.balanced,
    showPerfHud: false,
    adaptiveResolution: true,
    celestialGrade: 'natural',
  };
}

export function normalizeCelestialGrade(
  value: unknown,
  fallback: CelestialAtmosphereGrade = 'natural'
): CelestialAtmosphereGrade {
  if (value === 'natural' || value === 'aurora' || value === 'eclipse') {
    return value;
  }
  return fallback;
}

export function clampRenderScale(value: unknown, fallback = 0.85): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(0.55, Math.min(1.0, Number(value.toFixed(2))));
}

export function normalizeShadowQuality(
  value: unknown,
  fallback: ShadowQuality = 'medium'
): ShadowQuality {
  if (value === 'off' || value === 'medium' || value === 'high') {
    return value;
  }
  return fallback;
}

export function normalizeParticleQuality(
  value: unknown,
  fallback: ParticleQuality = 'medium'
): ParticleQuality {
  if (value === 'low' || value === 'medium' || value === 'high') {
    return value;
  }
  return fallback;
}

export function normalizeLightingQuality(
  value: unknown,
  fallback: LightingQuality = 'standard'
): LightingQuality {
  if (value === 'lite' || value === 'standard') {
    return value;
  }
  return fallback;
}

export function normalizeFpsLimit(
  value: unknown,
  fallback: FpsLimitOption = 60
): FpsLimitOption {
  if (value === 0 || value === 30 || value === 45 || value === 60) {
    return value;
  }
  return fallback;
}

export function detectMatchingGraphicsPreset(
  profile: GraphicsProfileConfig
): GraphicsPreset {
  const presets: Array<Exclude<GraphicsPreset, 'custom'>> = [
    'performance',
    'balanced',
    'quality',
  ];
  for (let i = 0; i < presets.length; i++) {
    const key = presets[i];
    const target = GRAPHICS_PRESET_CONFIGS[key];
    if (
      Math.abs(profile.renderScale - target.renderScale) < 0.015 &&
      profile.shadowQuality === target.shadowQuality &&
      profile.particleQuality === target.particleQuality &&
      profile.lightingQuality === target.lightingQuality &&
      profile.fpsLimit === target.fpsLimit
    ) {
      return key;
    }
  }
  return 'custom';
}

export function resolveGraphicsSettings(
  settings?: Partial<CameraSettings> | null
): ResolvedGraphicsSettings {
  const defaults = getDefaultGraphicsSettings();
  if (!settings || typeof settings !== 'object') {
    return defaults;
  }

  const presetBase =
    settings.graphicsPreset === 'performance' ||
    settings.graphicsPreset === 'balanced' ||
    settings.graphicsPreset === 'quality'
      ? GRAPHICS_PRESET_CONFIGS[settings.graphicsPreset]
      : defaults;

  const renderScale = clampRenderScale(settings.renderScale, presetBase.renderScale);
  const shadowQuality = normalizeShadowQuality(
    settings.shadowQuality,
    presetBase.shadowQuality
  );
  const particleQuality = normalizeParticleQuality(
    settings.particleQuality,
    presetBase.particleQuality
  );
  const lightingQuality = normalizeLightingQuality(
    settings.lightingQuality,
    presetBase.lightingQuality
  );
  const fpsLimit = normalizeFpsLimit(settings.fpsLimit, presetBase.fpsLimit);
  const showPerfHud =
    typeof settings.showPerfHud === 'boolean' ? settings.showPerfHud : defaults.showPerfHud;
  const adaptiveResolution =
    typeof settings.adaptiveResolution === 'boolean'
      ? settings.adaptiveResolution
      : defaults.adaptiveResolution;
  const celestialGrade = normalizeCelestialGrade(
    settings.celestialGrade,
    defaults.celestialGrade
  );

  const matchedPreset = detectMatchingGraphicsPreset({
    renderScale,
    shadowQuality,
    particleQuality,
    lightingQuality,
    fpsLimit,
  });

  return {
    graphicsPreset: matchedPreset,
    renderScale,
    shadowQuality,
    particleQuality,
    lightingQuality,
    fpsLimit,
    showPerfHud,
    adaptiveResolution,
    celestialGrade,
  };
}

export function mergeGraphicsSettingsPatch(
  current: Partial<CameraSettings>,
  patch: Partial<CameraSettings>
): ResolvedGraphicsSettings {
  const currentResolved = resolveGraphicsSettings(current);

  if (
    patch.graphicsPreset === 'performance' ||
    patch.graphicsPreset === 'balanced' ||
    patch.graphicsPreset === 'quality'
  ) {
    const presetConfig = GRAPHICS_PRESET_CONFIGS[patch.graphicsPreset];
    return {
      graphicsPreset: patch.graphicsPreset,
      ...presetConfig,
      showPerfHud:
        typeof patch.showPerfHud === 'boolean'
          ? patch.showPerfHud
          : currentResolved.showPerfHud,
      adaptiveResolution:
        typeof patch.adaptiveResolution === 'boolean'
          ? patch.adaptiveResolution
          : currentResolved.adaptiveResolution,
      celestialGrade: normalizeCelestialGrade(
        patch.celestialGrade,
        currentResolved.celestialGrade
      ),
    };
  }

  return resolveGraphicsSettings({
    ...currentResolved,
    ...patch,
  });
}

export function getParticleScaleFactor(quality: ParticleQuality): number {
  if (quality === 'low') return 0.35;
  if (quality === 'medium') return 0.7;
  return 1.0;
}

export function getShadowMapSizeForQuality(quality: ShadowQuality): number {
  if (quality === 'off') return 0;
  if (quality === 'medium') return 512;
  return 1024;
}

export function computeEffectivePixelRatio(
  devicePixelRatio: number,
  maxPixelRatio: number,
  renderScale: number,
  isHeadless: boolean,
  isSoftwareGl: boolean
): number {
  if (isHeadless) return 0.8;
  const baseCap = isSoftwareGl
    ? Math.min(devicePixelRatio || 1, 1.0)
    : Math.min(Math.max(1, devicePixelRatio || 1), maxPixelRatio);
  const scaled = baseCap * clampRenderScale(renderScale, 0.85);
  return Math.max(0.5, Number(scaled.toFixed(2)));
}

export function shouldSkipRedundantStaticRender(
  appState: GameAppState,
  pausedFrameRendered: boolean,
  forceRerender = false
): boolean {
  if (forceRerender) return false;
  if (appState !== 'paused' && appState !== 'gameover') return false;
  return pausedFrameRendered;
}

export function shouldStepPacedFrame(
  nowMs: number,
  lastFrameMs: number,
  fpsLimit: FpsLimitOption
): boolean {
  if (fpsLimit <= 0) return true;
  const minIntervalMs = 1000 / fpsLimit - 1.5;
  return nowMs - lastFrameMs >= minIntervalMs;
}

export interface AdaptiveFrameGovernorState {
  emaFrameMs: number;
  dynamicScaleFactor: number;
  overBudgetStreak: number;
  underBudgetStreak: number;
  cooldownFrames: number;
}

export function createAdaptiveFrameGovernor(): AdaptiveFrameGovernorState {
  return {
    emaFrameMs: 16.67,
    dynamicScaleFactor: 1.0,
    overBudgetStreak: 0,
    underBudgetStreak: 0,
    cooldownFrames: 0,
  };
}

export function stepAdaptiveFrameGovernor(
  state: AdaptiveFrameGovernorState,
  frameDeltaMs: number,
  configuredRenderScale: number,
  adaptiveEnabled: boolean,
  bypassGovernor: boolean
): number {
  if (!adaptiveEnabled || bypassGovernor) {
    state.dynamicScaleFactor = 1.0;
    state.overBudgetStreak = 0;
    state.underBudgetStreak = 0;
    state.cooldownFrames = 0;
    return 1.0;
  }
  if (!Number.isFinite(frameDeltaMs) || frameDeltaMs <= 0 || frameDeltaMs > 250) {
    return state.dynamicScaleFactor;
  }

  state.emaFrameMs = state.emaFrameMs * 0.85 + frameDeltaMs * 0.15;
  if (state.cooldownFrames > 0) {
    state.cooldownFrames -= 1;
    return state.dynamicScaleFactor;
  }

  const safeConfiguredScale = clampRenderScale(configuredRenderScale, 0.85);
  const minFactor = Math.min(1.0, Number((0.6 / safeConfiguredScale).toFixed(3)));

  if (state.emaFrameMs > 21.5) {
    state.overBudgetStreak += 1;
    state.underBudgetStreak = 0;
    if (state.overBudgetStreak >= 18) {
      const nextFactor = Math.max(
        minFactor,
        Number((state.dynamicScaleFactor * 0.88).toFixed(3))
      );
      state.overBudgetStreak = 0;
      if (nextFactor < state.dynamicScaleFactor - 0.005) {
        state.dynamicScaleFactor = nextFactor;
        state.cooldownFrames = 24;
      }
    }
  } else if (state.emaFrameMs < 14.2) {
    state.underBudgetStreak += 1;
    state.overBudgetStreak = 0;
    if (state.underBudgetStreak >= 45 && state.dynamicScaleFactor < 1.0) {
      state.dynamicScaleFactor = Math.min(
        1.0,
        Number((state.dynamicScaleFactor + 0.06).toFixed(3))
      );
      state.underBudgetStreak = 0;
      state.cooldownFrames = 30;
    }
  } else {
    state.overBudgetStreak = Math.max(0, state.overBudgetStreak - 1);
    state.underBudgetStreak = Math.max(0, state.underBudgetStreak - 1);
  }

  return state.dynamicScaleFactor;
}

