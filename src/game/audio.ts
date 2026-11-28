import type {
  BossAttackType,
  CampaignChapterId,
  ChronicleLoomEndingId,
  CombatEvent,
  GameAppState,
  StyleRankTier,
} from './types.ts';

const MUTE_STORAGE_KEY = 'afterframe_audio_muted_v1';

export interface AmbientMixState {
  appState: GameAppState;
  chapter: CampaignChapterId;
  bossActive: boolean;
  bossPhase: number;
  bossCoreExposed: boolean;
  adrenalineTier: number;
  selectedEnding: ChronicleLoomEndingId | null;
  styleRankTier?: StyleRankTier;
}

export interface AmbientPulseVoice {
  intervalSec: number;
  durationSec: number;
  bassFreq: number;
  padFreq: number;
  shimmerFreq: number | null;
  bassGain: number;
  padGain: number;
  shimmerGain: number;
  waveform: 'sine' | 'triangle';
}

const CHAPTER_BASE_ROOTS: Record<CampaignChapterId, number> = {
  prologue: 73.42, // D2 — Orbital drydock cold hum
  chapter_1_helix: 69.3, // C#2 — Containment tension
  chapter_2_choir: 82.41, // E2 — Acoustic harmonic choir
  chapter_3_curator: 77.78, // D#2 — Vault resonance
  chapter_4_matron: 61.74, // B1 — Deep ward pulse
  chapter_5_loom: 73.42, // D2 — Loom convergence
};

const COMBAT_RATIOS = [1, 1.5, 1.189, 1.335, 1.5, 1.782, 1.498, 2];
const CALM_RATIOS = [1, 1.5, 2, 1.335];

export function computeAmbientPulseVoice(
  state: AmbientMixState,
  stepIndex: number
): AmbientPulseVoice | null {
  if (state.appState !== 'playing' || state.selectedEnding === 'silence') {
    return null;
  }

  const baseRoot = CHAPTER_BASE_ROOTS[state.chapter] ?? 73.42;
  const adrTier = Math.max(0, Math.min(5, Math.floor(state.adrenalineTier || 0)));
  const isStyleHigh = state.styleRankTier === 'S' || state.styleRankTier === 'SSS';
  const isStylePeak = state.styleRankTier === 'SSS';
  const highTension = state.bossActive || adrTier >= 3 || isStyleHigh;
  const phaseTwo = (state.bossActive && state.bossPhase >= 2) || isStylePeak;
  const step = Math.abs(Math.floor(stepIndex));

  const intervalSec =
    state.selectedEnding === 'witness'
      ? 0.54
      : state.selectedEnding === 'continuity'
        ? 0.68
        : phaseTwo
          ? 0.44
          : highTension
            ? 0.52
            : 0.78;

  const ratios = highTension ? COMBAT_RATIOS : CALM_RATIOS;
  const ratio = ratios[step % ratios.length];
  const octaveBoost = state.selectedEnding === 'witness' ? 2 : state.bossCoreExposed || isStylePeak ? 1.5 : 1;

  const bassFreq = Number((baseRoot * (phaseTwo && step % 4 === 2 ? 1.122 : 1)).toFixed(2));
  const padFreq = Number((baseRoot * 2 * ratio * (state.selectedEnding === 'continuity' ? 1.25 : 1)).toFixed(2));
  const shouldShimmer =
    state.bossCoreExposed ||
    state.selectedEnding === 'witness' ||
    isStyleHigh ||
    (adrTier >= 2 && step % 2 === 1) ||
    step % 4 === 0;
  const shimmerFreq = shouldShimmer
    ? Number((baseRoot * 4 * ratio * octaveBoost).toFixed(2))
    : null;

  return {
    intervalSec,
    durationSec: Number(Math.min(0.95, intervalSec * 1.12).toFixed(3)),
    bassFreq,
    padFreq,
    shimmerFreq,
    bassGain: phaseTwo ? 0.052 : highTension ? 0.044 : 0.032,
    padGain: state.selectedEnding === 'witness' ? 0.032 : highTension ? 0.026 : 0.02,
    shimmerGain: state.bossCoreExposed || isStylePeak ? 0.024 : 0.014,
    waveform: phaseTwo ? 'triangle' : 'sine',
  };
}

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private muted: boolean = false;
  private disposed: boolean = false;
  private masterVolume = 0.85;
  private musicVolume = 0.7;
  private sfxVolume = 0.9;
  private ambientPulseTimer = 0.25;
  private ambientStepIndex = 0;

  constructor() {
    try {
      const saved = window.localStorage.getItem(MUTE_STORAGE_KEY);
      if (saved === 'true') {
        this.muted = true;
      }
    } catch {
      // Ignore storage errors
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(mute: boolean): void {
    this.muted = mute;
    try {
      window.localStorage.setItem(MUTE_STORAGE_KEY, mute ? 'true' : 'false');
    } catch {
      // Ignore storage errors
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  public setVolumeSettings(settings: {
    masterVolume?: number;
    musicVolume?: number;
    sfxVolume?: number;
  }): void {
    if (typeof settings.masterVolume === 'number' && Number.isFinite(settings.masterVolume)) {
      this.masterVolume = Math.max(0, Math.min(1, settings.masterVolume));
    }
    if (typeof settings.musicVolume === 'number' && Number.isFinite(settings.musicVolume)) {
      this.musicVolume = Math.max(0, Math.min(1, settings.musicVolume));
    }
    if (typeof settings.sfxVolume === 'number' && Number.isFinite(settings.sfxVolume)) {
      this.sfxVolume = Math.max(0, Math.min(1, settings.sfxVolume));
    }
    if (this.ctx) {
      this.syncBusGains(this.ctx);
    }
  }

  public getVolumeSettings(): {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
  } {
    return {
      masterVolume: this.masterVolume,
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
    };
  }

  private getEffectiveBusScale(bus: 'sfx' | 'music' = 'sfx'): number {
    const busVol = bus === 'music' ? this.musicVolume : this.sfxVolume;
    return Math.max(0, Math.min(1.5, this.masterVolume * busVol));
  }

  private syncBusGains(ctx: AudioContext): void {
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, ctx.currentTime);
    }
    if (this.sfxGain) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, ctx.currentTime);
    }
    if (this.musicGain) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, ctx.currentTime);
    }
  }

  private getOutputNode(ctx: AudioContext, bus: 'sfx' | 'music' = 'sfx'): AudioNode {
    if (!this.masterGain) {
      this.masterGain = ctx.createGain();
      this.masterGain.connect(ctx.destination);
    }
    if (!this.sfxGain) {
      this.sfxGain = ctx.createGain();
      this.sfxGain.connect(this.masterGain);
    }
    if (!this.musicGain) {
      this.musicGain = ctx.createGain();
      this.musicGain.connect(this.masterGain);
    }
    this.syncBusGains(ctx);
    return bus === 'music' ? this.musicGain : this.sfxGain;
  }

  private isBossEnemyId(enemyId?: string): boolean {
    return (
      enemyId === 'helix-04' ||
      enemyId === 'the-choir' ||
      enemyId === 'the-curator' ||
      enemyId === 'matron-v' ||
      enemyId === 'warden-prime'
    );
  }

  public isDisposed(): boolean {
    return this.disposed;
  }

  public resurrect(): void {
    this.disposed = false;
  }

  public unlock(): boolean {
    if (this.disposed) {
      this.disposed = false;
    }
    if (this.muted || typeof window === 'undefined') return false;
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (!this.ctx) return false;
      this.getOutputNode(this.ctx, 'sfx');
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume().catch(() => {});
      }
      return true;
    } catch {
      return false;
    }
  }

  public getDiagnostics(): {
    disposed: boolean;
    muted: boolean;
    contextState: string;
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
  } {
    return {
      disposed: this.disposed,
      muted: this.muted,
      contextState: this.ctx ? this.ctx.state : 'uninitialized',
      masterVolume: this.masterVolume,
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
    };
  }

  private ensureContext(bus: 'sfx' | 'music' = 'sfx'): AudioContext | null {
    if (this.disposed || this.muted) return null;
    if (this.getEffectiveBusScale(bus) <= 0.001) return null;
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  private pitchJitter(baseFreq: number, pct = 0.07): number {
    return baseFreq * (1 + (Math.random() * 2 - 1) * pct);
  }

  public playEvents(events: CombatEvent[]): void {
    if (this.disposed || this.muted || events.length === 0) return;
    for (const ev of events) {
      switch (ev.type) {
        case 'player_light_swing':
          this.playLightSwing();
          break;
        case 'player_heavy_charge_ready':
          this.playChargeReady();
          break;
        case 'player_heavy_swing':
          this.playHeavySwing();
          break;
        case 'player_hit_enemy':
          this.playHitEnemy(
            Boolean(ev.isHeavy),
            Boolean(ev.isCriticalOrVulnerable),
            Boolean(ev.isGuarded)
          );
          break;
        case 'enemy_staggered':
          this.playStaggerBreak();
          break;
        case 'enemy_killed':
          this.playEnemyKilled();
          break;
        case 'enemy_telegraph_start':
          if (!this.isBossEnemyId(ev.enemyId)) {
            this.playTelegraphWarning();
          }
          break;
        case 'enemy_attack_strike':
          if (!this.isBossEnemyId(ev.enemyId)) {
            this.playEnemyStrike();
          }
          break;
        case 'boss_activated':
          this.playBossActivated();
          break;
        case 'boss_telegraph_start':
          this.playBossTelegraph(ev.bossAttack ?? 'helical_sweep');
          break;
        case 'boss_attack_strike':
          this.playBossAttackStrike(ev.bossAttack ?? 'helical_sweep');
          break;
        case 'boss_shockwave_burst':
          this.playBossShockwaveBurst();
          break;
        case 'boss_core_exposed':
          this.playBossCoreExposed();
          break;
        case 'boss_phase_transition':
          this.playBossPhaseTransition();
          break;
        case 'boss_staggered':
          this.playStaggerBreak();
          break;
        case 'boss_defeated':
          this.playBossDefeated();
          break;
        case 'player_parry_start':
          this.playParryStance();
          break;
        case 'player_parry_success':
          this.playParryDeflect();
          break;
        case 'player_riposte_strike':
          this.playRiposteStrike();
          break;
        case 'player_perfect_dodge':
          this.playPerfectDodge();
          break;
        case 'player_dodge':
          this.playDodge();
          break;
        case 'player_damaged':
          this.playPlayerHurt();
          break;
        case 'encounter_victory':
          this.playVictoryFanfare();
          break;
        case 'encounter_defeat':
          this.playDefeatSting();
          break;
        case 'echo_recording_started':
        case 'echo_recording_replaced':
          this.playEchoRecordStart();
          break;
        case 'echo_recording_ready':
          this.playEchoRecordComplete();
          break;
        case 'echo_recording_rejected':
        case 'echo_playback_rejected':
          this.playEchoInvalidBeep();
          break;
        case 'echo_playback_started':
          this.playEchoReplayStart();
          break;
        case 'echo_playback_completed':
          this.playEchoReplayEnd();
          break;
        case 'echo_cleared':
          this.playEchoCleared();
          break;
        case 'echo_action_visual':
          if (ev.echoAction === 'dodge') {
            this.playEchoDodge();
          } else if (ev.echoAction === 'parry') {
            this.playEchoParry();
          } else {
            this.playEchoSwing(Boolean(ev.isHeavy || ev.echoAction === 'heavy_swing'));
          }
          break;
        case 'echo_plate_activated':
          this.playPressurePlateActivated();
          break;
        case 'echo_plate_released':
          this.playPressurePlateDeactivated();
          break;
        case 'echo_receiver_activated':
          this.playHeavyReceiverCharged();
          break;
        case 'echo_receiver_expired':
          this.playPressurePlateDeactivated();
          break;
        case 'echo_receiver_rejected':
          this.playEchoInvalidBeep();
          break;
        case 'echo_combine_barrier_opened':
        case 'echo_puzzle_completed':
          this.playCombineBarrierOpened();
          break;
        case 'containment_transition_started':
          this.playBossActivated();
          break;
        case 'echo_relay_success':
          this.playEchoRelaySuccess();
          break;
        case 'echo_relay_rejected':
          this.playEchoInvalidBeep();
          break;
        case 'echo_resonance_primed':
          this.playResonancePrimed();
          break;
        case 'echo_resonance_expired':
          this.playResonanceExpired();
          break;
        case 'resonance_convergence':
          this.playResonanceConvergence();
          break;
        case 'resonance_convergence_rejected':
          this.playEchoInvalidBeep();
          break;
        case 'choir_node_primed':
          this.playChoirNodePrimed();
          break;
        case 'choir_node_synchronized':
        case 'choir_sync_completed':
          this.playChoirSyncCompleted();
          break;
        case 'choir_sync_failed':
          this.playEchoInvalidBeep();
          break;
        case 'gravity_pin_activated':
          this.playGravityPinActivated();
          break;
        case 'gravity_pin_rejected':
        case 'echo_collapse_rejected':
          this.playEchoInvalidBeep();
          break;
        case 'curator_trace_spawned':
          this.playTelegraphWarning();
          break;
        case 'curator_trace_executed':
          this.playEnemyStrike();
          break;
        case 'curator_decoy_eliminated':
          this.playEchoCleared();
          break;
        case 'siphon_flux_drained':
        case 'null_weaver_flux_dampened':
          this.playSiphonFluxDrained();
          break;
        case 'eraser_echo_disrupted':
        case 'matron_chrono_sever':
          this.playChronoSeverWarning();
          break;
        case 'echo_collapse_detonated':
          this.playEchoCollapseDetonated();
          break;
        case 'campaign_chapter_advanced':
          this.playVictoryFanfare();
          break;
        case 'chronicle_loom_ending_selected':
          this.playLoomEndingSelected();
          break;
        case 'comms_transmission_started':
          this.playCommsTransmission(ev.commsSpeaker, ev.commsClassification);
          break;
        case 'weapon_switched':
          this.playWeaponSwitch(
            ev.weaponId === 'pulsecaster' || ev.weaponId === 'phase_rail'
          );
          break;
        case 'player_pulse_shot':
          this.playPulsecasterShot(false);
          break;
        case 'player_pulse_heavy_shot':
          this.playPulsecasterShot(true);
          break;
        case 'player_rail_shot':
          this.playPhaseRailShot(false);
          break;
        case 'player_rail_heavy_shot':
          this.playPhaseRailShot(true);
          break;
        case 'breaker_shockwave_slam':
          this.playGravBreakerSlam(Boolean(ev.isHeavy));
          break;
        case 'pulse_overheated':
          this.playPulsecasterOverheat();
          break;
        case 'pulse_overheat_cleared':
          this.playPulsecasterCooldownReady();
          break;
        case 'pulse_impact_obstacle':
          this.playPulsecasterObstacleImpact();
          break;
        case 'progression_reward_granted':
          this.playProgressionReward();
          break;
        case 'weapon_upgrade_purchased':
          this.playWeaponUpgradeChime(true);
          break;
        case 'weapon_upgrade_equipped':
          this.playWeaponUpgradeChime(false);
          break;
        case 'weapon_upgrade_rejected':
          this.playEchoInvalidBeep();
          break;
        case 'environmental_interaction_completed':
          this.playPressurePlateActivated();
          break;
        case 'environmental_interaction_rejected':
          this.playEchoInvalidBeep();
          break;
        case 'mission_objective_completed':
        case 'codex_entry_discovered':
          this.playProgressionReward();
          break;
        case 'active_vent_success':
          this.playActiveVentSuccess();
          break;
        case 'active_vent_missed':
          this.playEchoInvalidBeep();
          break;
        case 'adrenaline_tier_changed':
          if ((ev.postureBonus ?? 0) > 0 && (ev.amount ?? 0) >= 1) {
            this.playAdrenalineTierUp(ev.amount ?? 1);
          }
          break;
        case 'chrono_execution_finisher':
          this.playChronoExecutionFinisher();
          break;
        case 'lock_on_engaged':
          this.playLockOnPing(Boolean(ev.amount === 1));
          break;
        case 'obstacle_damaged':
          this.playPulsecasterObstacleImpact();
          break;
        case 'obstacle_destroyed':
          this.playCapacitorOverloadExplosion();
          break;
        case 'boost_pad_triggered':
          this.playBoostPadSurge();
          break;
        case 'rig_module_purchased':
          this.playWeaponUpgradeChime(true);
          break;
        case 'rig_module_equipped':
          this.playWeaponUpgradeChime(false);
          break;
        case 'flux_pool_spawned':
          this.playFluxPoolSpawned();
          break;
        case 'temporal_thread_triggered':
          this.playTemporalThreadTriggered();
          break;
        case 'fragment_cache_claimed':
          this.playProgressionReward();
          break;
        case 'sector_beacon_activated':
          this.playSectorBeaconActivated();
          break;
        case 'weapon_upgrade_overclocked':
          this.playWeaponUpgradeChime(true);
          break;
        case 'weapon_mythic_awakened':
          this.playWeaponUpgradeChime(true);
          this.playStoryChoiceResolved();
          break;
        case 'rig_module_overclocked':
          this.playWeaponUpgradeChime(true);
          break;
        case 'sentinel_mode_switched':
          this.playTemporalThreadTriggered();
          break;
        case 'chrono_ward_absorbed':
          this.playParryDeflect();
          break;
        case 'chrono_ward_shatter':
          this.playTemporalRiftSealed();
          break;
        case 'phantom_afterimage_strike':
          this.playEchoSwing(true);
          break;
        case 'boss_core_unlocked':
          this.playWeaponUpgradeChime(true);
          this.playTemporalRiftSealed();
          break;
        case 'boss_core_equipped':
          this.playWeaponUpgradeChime(false);
          this.playTemporalThreadTriggered();
          break;
        case 'boss_core_pulse':
          this.playTemporalThreadTriggered();
          this.playEchoSwing(true);
          break;
        case 'boss_core_omega_awakened':
          this.playBossCoreOmegaAwakened();
          break;
        case 'confluence_burst_triggered':
          this.playConfluenceBurstTriggered();
          break;
        case 'neural_protocol_purchased':
          this.playTemporalThreadTriggered();
          break;
        case 'story_choice_resolved':
          this.playStoryChoiceResolved();
          break;
        case 'holo_memory_projected':
          this.playHoloMemoryProjected();
          break;
        case 'temporal_rift_spawned':
          this.playTemporalRiftSpawned();
          break;
        case 'temporal_rift_sealed':
          this.playTemporalRiftSealed();
          break;
        case 'temporal_rift_ruptured':
          this.playTemporalRiftRuptured();
          break;
        case 'recursion_loop_cleared':
          this.playRecursionLoopCleared();
          break;
        case 'recursion_relic_picked':
          this.playRecursionRelicPicked();
          break;
        case 'phase_stalker_blink':
          this.playPhaseStalkerBlink();
          break;
        case 'chrono_mortar_barrage_fired':
          this.playChronoMortarFired();
          break;
        case 'chrono_mortar_detonated':
          this.playChronoMortarDetonated();
          break;
        case 'conductor_tether_severed':
          this.playConductorTetherSevered();
          break;
        case 'volatile_core_detonated':
          this.playVolatileCoreDetonated();
          break;
        case 'chrono_overdrive_activated':
          this.playChronoOverdriveActivated();
          break;
        case 'chrono_overdrive_ended':
          this.playChronoOverdriveEnded();
          break;
        case 'gauntlet_stage_cleared':
          this.playGauntletStageCleared();
          break;
        case 'gauntlet_victory':
          this.playGauntletVictory();
          break;
        case 'expedition_breach_triggered':
          this.playExpeditionBreach();
          break;
        case 'expedition_airlock_unlocked':
          this.playExpeditionAirlockOpen();
          break;
        case 'expedition_sector_transit':
          this.playExpeditionTransit();
          break;
        case 'safe_room_entered':
          this.playExpeditionTransit();
          break;
        case 'safe_room_med_used':
          this.playActiveVentSuccess();
          break;
        case 'safe_room_lysa_briefing':
          this.playProgressionReward();
          break;
        case 'secret_vault_unlocked':
          this.playExpeditionAirlockOpen();
          break;
        case 'secret_vault_looted':
          this.playProgressionReward();
          break;
        case 'ng_plus_started':
          this.playGauntletVictory();
          break;
        case 'nanite_injector_used':
          this.playActiveVentSuccess();
          break;
        case 'aegis_shield_absorbed':
          this.playParryDeflect();
          break;
        case 'combat_drone_fired':
          this.playPulsecasterShot(false);
          break;
        case 'combat_drone_shield_triggered':
          this.playSectorBeaconActivated();
          break;
        case 'fabricator_purchased':
        case 'skin_equipped':
          this.playWeaponUpgradeChime(true);
          break;
        case 'boss_killcam_triggered':
          this.playChronoOverdriveActivated();
          break;
        case 'paradox_rift_entered':
          this.playTemporalRiftSpawned();
          break;
        case 'echo_zero_defeated':
          this.playGauntletVictory();
          break;
        case 'achievement_unlocked':
          this.playProgressionReward();
          break;
        case 'player_scythe_swing':
          this.playLightSwing();
          break;
        case 'scythe_vortex_pull':
          this.playTemporalRiftSpawned();
          break;
        case 'mod_volt_arc_chain':
          this.playPulsecasterShot(false);
          break;
        case 'mod_siphon_leech_heal':
          this.playActiveVentSuccess();
          break;
        case 'mod_chrono_nova_burst':
          this.playExpeditionBreach();
          break;
        case 'style_rank_up':
          this.playWeaponUpgradeChime(true);
          break;
        case 'chrono_finisher_triggered':
          this.playChronoOverdriveActivated();
          this.playExpeditionBreach();
          break;
        case 'daily_trial_started':
          this.playSectorBeaconActivated();
          break;
        case 'daily_trial_completed':
          this.playGauntletVictory();
          break;
        case 'flash_swap_triggered':
          this.playWeaponUpgradeChime(true);
          this.playActiveVentSuccess();
          break;
        case 'chrono_chain_milestone':
          this.playProgressionReward();
          break;
        case 'weapon_overcharge_ready':
          this.playChronoOverdriveActivated();
          this.playWeaponUpgradeChime(true);
          break;
        case 'twin_sync_tier_up':
          this.playProgressionReward();
          break;
        case 'twin_sync_pincer':
          this.playActiveVentSuccess();
          break;
        case 'weakpoint_break_triggered':
          this.playActiveVentSuccess();
          this.playWeaponUpgradeChime(true);
          break;
        case 'chrono_momentum_tier_up':
          this.playProgressionReward();
          break;
        case 'chrono_nexus_linked':
          this.playChronoOverdriveActivated();
          this.playProgressionReward();
          break;
        case 'chrono_nexus_pulse':
          this.playActiveVentSuccess();
          break;
        case 'weapon_swap_resonance':
          this.playWeaponUpgradeChime(true);
          this.playActiveVentSuccess();
          break;
        case 'echo_doctrine_switched':
          this.playTemporalThreadTriggered();
          break;
        case 'echo_doctrine_nova_pulse':
          this.playTemporalRiftSealed();
          this.playEchoSwing(true);
          break;
        case 'temporal_slip_triggered':
          this.playTemporalSlipTriggered();
          break;
        case 'sovereign_astral_pulse':
          this.playSovereignAstralPulse();
          break;
        case 'mastery_bounty_claimed':
          this.playMasteryBountyClaimed();
          break;
      }
    }
  }

  public playSovereignAstralPulse(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime;
    const harmonicChord = [523.25, 783.99, 1174.66];
    for (let i = 0; i < harmonicChord.length; i += 1) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i === 0 ? 'triangle' : 'sine';
      const startAt = now + i * 0.022;
      osc.frequency.setValueAtTime(harmonicChord[i], startAt);
      osc.frequency.exponentialRampToValueAtTime(harmonicChord[i] * 1.12, startAt + 0.32);
      gain.gain.setValueAtTime(0.001, startAt);
      gain.gain.linearRampToValueAtTime(0.11 - i * 0.02, startAt + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.36);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(startAt);
      osc.stop(startAt + 0.38);
    }
  }

  public playTemporalSlipTriggered(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime;

    // Sub-sine time-dilation pitch drop (180Hz -> 54Hz)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(180, now);
    subOsc.frequency.exponentialRampToValueAtTime(54, now + 0.34);
    subGain.gain.setValueAtTime(0.001, now);
    subGain.gain.linearRampToValueAtTime(0.24, now + 0.018);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(now);
    subOsc.stop(now + 0.4);

    // Crystalline horological shimmer fifths (987.77Hz B5 -> 1479.98Hz F#6)
    const chimeNotes = [987.77, 1479.98];
    for (let i = 0; i < chimeNotes.length; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startAt = now + i * 0.045;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(chimeNotes[i], startAt);
      gain.gain.setValueAtTime(0.001, startAt);
      gain.gain.linearRampToValueAtTime(0.11, startAt + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.28);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(startAt);
      osc.stop(startAt + 0.3);
    }
  }

  public playMasteryBountyClaimed(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime;
    const triad = [587.33, 739.99, 880, 1174.66]; // D5 - F#5 - A5 - D6 sovereign triad
    for (let i = 0; i < triad.length; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t0 = now + i * 0.055;
      osc.type = i === triad.length - 1 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(triad[i], t0);
      gain.gain.setValueAtTime(0.001, t0);
      gain.gain.linearRampToValueAtTime(0.14, t0 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.34);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t0);
      osc.stop(t0 + 0.36);
    }
  }

  public playCameraShutter(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1600, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.06);
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.14, now + 0.008);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  private playExpeditionBreach(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime;
    const sub = ctx.createOscillator();
    const g = ctx.createGain();
    sub.type = 'sawtooth';
    sub.frequency.setValueAtTime(190, now);
    sub.frequency.exponentialRampToValueAtTime(48, now + 0.38);
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.22, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
    sub.connect(g);
    g.connect(this.sfxGain);
    sub.start(now);
    sub.stop(now + 0.44);

    const chime = ctx.createOscillator();
    const cg = ctx.createGain();
    chime.type = 'triangle';
    chime.frequency.setValueAtTime(523.25, now + 0.03);
    chime.frequency.exponentialRampToValueAtTime(783.99, now + 0.22);
    cg.gain.setValueAtTime(0.001, now + 0.03);
    cg.gain.linearRampToValueAtTime(0.11, now + 0.05);
    cg.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    chime.connect(cg);
    cg.connect(this.sfxGain);
    chime.start(now + 0.03);
    chime.stop(now + 0.3);
  }

  private playExpeditionAirlockOpen(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime;
    const chord = [392.0, 523.25, 659.25, 783.99, 1046.5];
    for (let i = 0; i < chord.length; i++) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const t0 = now + i * 0.055;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(chord[i], t0);
      g.gain.setValueAtTime(0.001, t0);
      g.gain.linearRampToValueAtTime(0.11, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.42);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(t0);
      osc.stop(t0 + 0.44);
    }
  }

  private playExpeditionTransit(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime;
    const sweep = ctx.createOscillator();
    const g = ctx.createGain();
    sweep.type = 'sine';
    sweep.frequency.setValueAtTime(210, now);
    sweep.frequency.exponentialRampToValueAtTime(920, now + 0.34);
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.15, now + 0.04);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    sweep.connect(g);
    g.connect(this.sfxGain);
    sweep.start(now);
    sweep.stop(now + 0.42);
  }

  private playChronoOverdriveActivated(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime;
    // Deep sub-bass time-dilation warp drop
    const bass = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bass.type = 'sawtooth';
    bass.frequency.setValueAtTime(155, now);
    bass.frequency.exponentialRampToValueAtTime(38, now + 0.48);
    const lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.setValueAtTime(420, now);
    lpf.frequency.exponentialRampToValueAtTime(95, now + 0.48);
    bassGain.gain.setValueAtTime(0.001, now);
    bassGain.gain.linearRampToValueAtTime(0.24, now + 0.03);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.56);
    bass.connect(lpf);
    lpf.connect(bassGain);
    bassGain.connect(this.sfxGain);
    bass.start(now);
    bass.stop(now + 0.58);

    // Crystalline astrolabe shimmer chord (D5, A5, E6)
    const freqs = [587.33, 880, 1318.51];
    for (let i = 0; i < freqs.length; i++) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      const t0 = now + i * 0.045;
      osc.frequency.setValueAtTime(freqs[i], t0);
      osc.frequency.exponentialRampToValueAtTime(freqs[i] * 0.96, t0 + 0.45);
      g.gain.setValueAtTime(0.001, t0);
      g.gain.linearRampToValueAtTime(0.09, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.5);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(t0);
      osc.stop(t0 + 0.52);
    }
  }

  private playChronoOverdriveEnded(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(70, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.24);
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.14, now + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  private playGauntletStageCleared(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime;
    const notes = [392.0, 493.88, 587.33, 783.99];
    for (let i = 0; i < notes.length; i++) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      const t0 = now + i * 0.075;
      osc.frequency.setValueAtTime(notes[i], t0);
      g.gain.setValueAtTime(0.001, t0);
      g.gain.linearRampToValueAtTime(0.11, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.36);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(t0);
      osc.stop(t0 + 0.38);
    }
  }

  private playGauntletVictory(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime;
    const notes = [293.66, 440.0, 587.33, 739.99, 880.0];
    for (let i = 0; i < notes.length; i++) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = i % 2 === 0 ? 'triangle' : 'sine';
      const t0 = now + i * 0.095;
      osc.frequency.setValueAtTime(notes[i], t0);
      g.gain.setValueAtTime(0.001, t0);
      g.gain.linearRampToValueAtTime(0.13, t0 + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.62);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(t0);
      osc.stop(t0 + 0.65);
    }
  }

  private playPhaseStalkerBlink(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(this.pitchJitter(880), now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.14);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.13, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.17);
  }

  private playChronoMortarFired(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(this.pitchJitter(160), now);
    osc.frequency.exponentialRampToValueAtTime(62, now + 0.24);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.28);
  }

  private playChronoMortarDetonated(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(this.pitchJitter(130), now);
    osc.frequency.exponentialRampToValueAtTime(34, now + 0.34);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.24, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.38);
  }

  private playConductorTetherSevered(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [680, 960];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + idx * 0.04;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.35, start + 0.14);
      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.16);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx));
      osc.start(start);
      osc.stop(start + 0.17);
    });
  }

  private playVolatileCoreDetonated(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const hi = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    hi.type = 'square';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);
    hi.frequency.setValueAtTime(620, now);
    hi.frequency.exponentialRampToValueAtTime(120, now + 0.25);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.24, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
    osc.connect(gain);
    hi.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    hi.start(now);
    osc.stop(now + 0.44);
    hi.stop(now + 0.27);
  }

  private playTemporalRiftSpawned(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const sub = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    sub.type = 'sine';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(760, now + 0.24);
    sub.frequency.setValueAtTime(110, now);
    sub.frequency.exponentialRampToValueAtTime(64, now + 0.28);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    osc.connect(gain);
    sub.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    sub.start(now);
    osc.stop(now + 0.34);
    sub.stop(now + 0.34);
  }

  private playTemporalRiftSealed(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + idx * 0.04;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.14, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.24);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx));
      osc.start(start);
      osc.stop(start + 0.26);
    });
  }

  private playTemporalRiftRuptured(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(48, now + 0.38);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.42);
  }

  private playRecursionLoopCleared(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const chord = [392.0, 493.88, 587.33, 783.99];
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + idx * 0.05;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.13, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.34);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx));
      osc.start(start);
      osc.stop(start + 0.36);
    });
  }

  private playRecursionRelicPicked(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const harm = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    harm.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.18);
    harm.frequency.setValueAtTime(880, now + 0.03);
    harm.frequency.exponentialRampToValueAtTime(1760, now + 0.22);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    harm.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    harm.start(now + 0.03);
    osc.stop(now + 0.26);
    harm.stop(now + 0.26);
  }

  private playSectorBeaconActivated(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const base = ctx.createOscillator();
    const harmonic = ctx.createOscillator();
    const gain = ctx.createGain();
    base.type = 'sawtooth';
    harmonic.type = 'sine';
    base.frequency.setValueAtTime(190, now);
    base.frequency.exponentialRampToValueAtTime(620, now + 0.28);
    harmonic.frequency.setValueAtTime(520, now + 0.03);
    harmonic.frequency.exponentialRampToValueAtTime(1240, now + 0.34);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    base.connect(gain);
    harmonic.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    base.start(now);
    harmonic.start(now + 0.03);
    base.stop(now + 0.4);
    harmonic.stop(now + 0.4);
  }

  private playStoryChoiceResolved(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const chord = [440, 554.37, 659.25, 880];
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + idx * 0.045;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx));
      osc.start(start);
      osc.stop(start + 0.3);
    });
  }

  private playCapacitorOverloadExplosion(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const sub = ctx.createOscillator();
    const crackle = ctx.createOscillator();
    const gain = ctx.createGain();
    sub.type = 'sawtooth';
    sub.frequency.setValueAtTime(165, now);
    sub.frequency.exponentialRampToValueAtTime(38, now + 0.34);
    crackle.type = 'square';
    crackle.frequency.setValueAtTime(620, now);
    crackle.frequency.exponentialRampToValueAtTime(120, now + 0.16);
    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
    sub.connect(gain);
    crackle.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    sub.start(now);
    crackle.start(now);
    sub.stop(now + 0.37);
    crackle.stop(now + 0.18);
  }

  private playBoostPadSurge(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const shimmer = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(980, now + 0.18);
    shimmer.type = 'sine';
    shimmer.frequency.setValueAtTime(680, now + 0.02);
    shimmer.frequency.exponentialRampToValueAtTime(1420, now + 0.2);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    shimmer.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    shimmer.start(now + 0.02);
    osc.stop(now + 0.23);
    shimmer.stop(now + 0.23);
  }

  private playFluxPoolSpawned(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.26);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.29);
  }

  private playTemporalThreadTriggered(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [587.33, 880, 1174.66];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + idx * 0.04;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.11, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.14);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx));
      osc.start(start);
      osc.stop(start + 0.15);
    });
  }

  private playActiveVentSuccess(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc2.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(1240, now + 0.14);
    osc2.frequency.setValueAtTime(780, now + 0.04);
    osc2.frequency.exponentialRampToValueAtTime(1560, now + 0.18);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.16, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc2.start(now + 0.04);
    osc.stop(now + 0.23);
    osc2.stop(now + 0.23);
  }

  private playAdrenalineTierUp(tier: number): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const baseFreq = 440 + Math.min(5, Math.max(1, tier)) * 75;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.16);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.11, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.21);
  }

  private playPhaseRailShot(isHeavy: boolean): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = isHeavy ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(this.pitchJitter(isHeavy ? 1180 : 1040), now);
    osc.frequency.exponentialRampToValueAtTime(
      isHeavy ? 190 : 320,
      now + (isHeavy ? 0.24 : 0.14)
    );
    gain.gain.setValueAtTime(isHeavy ? 0.16 : 0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isHeavy ? 0.25 : 0.15));
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + (isHeavy ? 0.26 : 0.16));
  }

  private playGravBreakerSlam(isHeavy: boolean): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(this.pitchJitter(isHeavy ? 145 : 190), now);
    osc.frequency.exponentialRampToValueAtTime(42, now + (isHeavy ? 0.28 : 0.19));
    gain.gain.setValueAtTime(isHeavy ? 0.22 : 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isHeavy ? 0.29 : 0.2));
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + (isHeavy ? 0.3 : 0.21));
  }

  private playProgressionReward(): void {
    const ctx = this.ensureContext('music');
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + idx * 0.055;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.08, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.14);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx, 'music'));
      osc.start(start);
      osc.stop(start + 0.15);
    });
  }

  private playWeaponUpgradeChime(isPurchase: boolean): void {
    const ctx = this.ensureContext('music');
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = isPurchase ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isPurchase ? 440 : 520, now);
    osc.frequency.exponentialRampToValueAtTime(isPurchase ? 880 : 740, now + 0.14);
    gain.gain.setValueAtTime(isPurchase ? 0.11 : 0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx, 'music'));
    osc.start(now);
    osc.stop(now + 0.17);
  }

  private playWeaponSwitch(toPulsecaster: boolean): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(toPulsecaster ? 420 : 620, now);
    osc.frequency.exponentialRampToValueAtTime(toPulsecaster ? 740 : 380, now + 0.08);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.1);
  }

  private playPulsecasterShot(isHeavy: boolean): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = isHeavy ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(this.pitchJitter(isHeavy ? 680 : 820), now);
    osc.frequency.exponentialRampToValueAtTime(isHeavy ? 140 : 240, now + (isHeavy ? 0.19 : 0.11));
    gain.gain.setValueAtTime(isHeavy ? 0.15 : 0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isHeavy ? 0.2 : 0.12));
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + (isHeavy ? 0.21 : 0.13));
  }

  private playPulsecasterOverheat(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.linearRampToValueAtTime(180, now + 0.26);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.29);
  }

  private playPulsecasterCooldownReady(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(540, now);
    osc.frequency.exponentialRampToValueAtTime(860, now + 0.12);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.14);
  }

  private playPulsecasterObstacleImpact(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(this.pitchJitter(360), now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.07);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.09);
  }

  private playLightSwing(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(this.pitchJitter(340), now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.11);
    gain.gain.setValueAtTime(0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.13);
  }

  private playChargeReady(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.14);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.17);
  }

  private playHeavySwing(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(this.pitchJitter(240), now);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.22);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.23);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.24);
  }

  private playHitEnemy(isHeavy: boolean, isVulnerable: boolean, isGuarded = false): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (isGuarded) {
      // Metallic armor deflect clank
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(this.pitchJitter(540), now);
      osc.frequency.exponentialRampToValueAtTime(290, now + 0.08);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx));
      osc.start(now);
      osc.stop(now + 0.1);
      return;
    }

    // Impact body thud
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = isHeavy ? 'sawtooth' : 'square';
    osc.frequency.setValueAtTime(this.pitchJitter(isHeavy ? 165 : 220), now);
    osc.frequency.exponentialRampToValueAtTime(48, now + (isHeavy ? 0.19 : 0.11));
    gain.gain.setValueAtTime(isHeavy ? 0.2 : 0.13, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isHeavy ? 0.2 : 0.12));
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.21);

    // Vulnerable crystal chime overlay
    if (isVulnerable) {
      const chime = ctx.createOscillator();
      const cGain = ctx.createGain();
      chime.type = 'sine';
      chime.frequency.setValueAtTime(980, now);
      chime.frequency.exponentialRampToValueAtTime(1480, now + 0.16);
      cGain.gain.setValueAtTime(0.14, now);
      cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      chime.connect(cGain);
      cGain.connect(this.getOutputNode(ctx));
      chime.start(now);
      chime.stop(now + 0.19);
    }
  }

  private playStaggerBreak(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqs = [440, 660, 880];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + idx * 0.03);
      gain.gain.setValueAtTime(0.12, now + idx * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.03 + 0.22);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx));
      osc.start(now + idx * 0.03);
      osc.stop(now + idx * 0.03 + 0.23);
    });
  }

  private playEnemyKilled(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.35);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.37);
  }

  private playTelegraphWarning(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.linearRampToValueAtTime(640, now + 0.24);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.26);
  }

  private playEnemyStrike(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(52, now + 0.16);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.18);
  }

  private playParryStance(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(480, now + 0.08);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.1);
  }

  private playParryDeflect(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqs = [780, 1170, 1560];
    freqs.forEach((f) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 0.92, now + 0.25);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx));
      osc.start(now);
      osc.stop(now + 0.27);
    });
  }

  private playRiposteStrike(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqs = [587.33, 880, 1318.51];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx === 0 ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.018);
      osc.frequency.exponentialRampToValueAtTime(f * 1.18, now + idx * 0.018 + 0.14);
      gain.gain.setValueAtTime(idx === 0 ? 0.11 : 0.09, now + idx * 0.018);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.018 + 0.16);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx));
      osc.start(now + idx * 0.018);
      osc.stop(now + idx * 0.018 + 0.17);
    });
  }

  private playDodge(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(this.pitchJitter(260), now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.12);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.14);
  }

  private playPlayerHurt(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(135, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.24);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.26);
  }

  private playVictoryFanfare(): void {
    const ctx = this.ensureContext('music');
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);
      gain.gain.setValueAtTime(0.14, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.4);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx, 'music'));
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.42);
    });
  }

  private playDefeatSting(): void {
    const ctx = this.ensureContext('music');
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [311.13, 277.18, 220, 164.81];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.11);
      gain.gain.setValueAtTime(0.13, now + idx * 0.11);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.11 + 0.38);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx, 'music'));
      osc.start(now + idx * 0.11);
      osc.stop(now + idx * 0.11 + 0.4);
    });
  }

  private playEchoRecordStart(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [440, 659.25];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.045);
      gain.gain.setValueAtTime(0.1, now + idx * 0.045);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.045 + 0.14);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx));
      osc.start(now + idx * 0.045);
      osc.stop(now + idx * 0.045 + 0.15);
    });
  }

  private playEchoRecordComplete(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      gain.gain.setValueAtTime(0.11, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.18);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx));
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.19);
    });
  }

  private playEchoInvalidBeep(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.setValueAtTime(165, now + 0.06);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.15);
  }

  private playEchoReplayStart(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [587.33, 880, 1174.66];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.035);
      gain.gain.setValueAtTime(0.12, now + idx * 0.035);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.035 + 0.24);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx));
      osc.start(now + idx * 0.035);
      osc.stop(now + idx * 0.035 + 0.25);
    });
  }

  private playEchoReplayEnd(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(784, now);
    osc.frequency.exponentialRampToValueAtTime(392, now + 0.18);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.2);
  }

  private playEchoCleared(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.14);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.16);
  }

  private playEchoSwing(isHeavy: boolean): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(this.pitchJitter(isHeavy ? 620 : 760), now);
    osc.frequency.exponentialRampToValueAtTime(isHeavy ? 240 : 320, now + 0.13);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.15);
  }

  private playEchoDodge(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(840, now + 0.1);
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.12);
  }

  private playEchoParry(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(920, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.09);
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.11);
  }

  private playPressurePlateActivated(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 987.77];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      gain.gain.setValueAtTime(0.13, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.28);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx));
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.3);
    });
  }

  private playPressurePlateDeactivated(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.16);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.18);
  }

  private playHeavyReceiverCharged(): void {
    const ctx = this.ensureContext('music');
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [392.0, 587.33, 783.99, 1174.66];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.045);
      gain.gain.setValueAtTime(0.14, now + idx * 0.045);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.045 + 0.34);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx, 'music'));
      osc.start(now + idx * 0.045);
      osc.stop(now + idx * 0.045 + 0.36);
    });
  }

  private playCombineBarrierOpened(): void {
    const ctx = this.ensureContext('music');
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      gain.gain.setValueAtTime(0.15, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.42);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx, 'music'));
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.44);
    });
  }

  private playEchoRelaySuccess(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [659.25, 987.77, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.03);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.15, now + idx * 0.03 + 0.16);
      gain.gain.setValueAtTime(0.13, now + idx * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.03 + 0.18);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx));
      osc.start(now + idx * 0.03);
      osc.stop(now + idx * 0.03 + 0.19);
    });
  }

  private playPerfectDodge(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [740, 1108.73, 1479.98];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + idx * 0.022;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.15, start + 0.16);
      gain.gain.setValueAtTime(0.11, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx));
      osc.start(start);
      osc.stop(start + 0.19);
    });
  }

  private playResonancePrimed(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [587.33, 880, 1174.66];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.028);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.08, now + idx * 0.028 + 0.22);
      gain.gain.setValueAtTime(0.12, now + idx * 0.028);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.028 + 0.24);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx));
      osc.start(now + idx * 0.028);
      osc.stop(now + idx * 0.028 + 0.25);
    });
  }

  private playResonanceExpired(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(310, now + 0.15);
    gain.gain.setValueAtTime(0.075, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.17);
  }

  private playResonanceConvergence(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Low kinetic guard-shatter impact drop
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sawtooth';
    sub.frequency.setValueAtTime(160, now);
    sub.frequency.exponentialRampToValueAtTime(42, now + 0.24);
    subGain.gain.setValueAtTime(0.2, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
    sub.connect(subGain);
    subGain.connect(this.getOutputNode(ctx));
    sub.start(now);
    sub.stop(now + 0.27);

    // Synchronized crystalline harmonic chord
    const harmonics = [880, 1318.51, 1760];
    harmonics.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.02);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.12, now + idx * 0.02 + 0.32);
      gain.gain.setValueAtTime(0.14, now + idx * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.02 + 0.34);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx));
      osc.start(now + idx * 0.02);
      osc.stop(now + idx * 0.02 + 0.35);
    });
  }

  private playBossActivated(): void {
    const ctx = this.ensureContext('music');
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [110, 146.83, 220];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.15, now + idx * 0.08 + 0.32);
      gain.gain.setValueAtTime(0.14, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.36);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx, 'music'));
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.38);
    });
  }

  private playBossTelegraph(attack: BossAttackType): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (
      attack === 'vector_ram' ||
      attack === 'surgical_incision' ||
      attack === 'directive_lance' ||
      attack === 'archive_lance'
    ) {
      // Rising turbine charge for directional lane commitment
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(attack === 'directive_lance' ? 165 : 140, now);
      osc.frequency.exponentialRampToValueAtTime(
        attack === 'directive_lance' ? 620 : 520,
        now + 0.38
      );
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx));
      osc.start(now);
      osc.stop(now + 0.42);
    } else if (
      attack === 'helical_sweep' ||
      attack === 'temporal_convergence_grid' ||
      attack === 'reconstructed_sweep'
    ) {
      // Dual counter-rotating saw whine for frontal arc cleave
      const freqs = attack === 'temporal_convergence_grid' ? [310, 465] : [280, 420];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.45, now + 0.34);
        gain.gain.setValueAtTime(0.12, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
        osc.connect(gain);
        gain.connect(this.getOutputNode(ctx));
        osc.start(now + idx * 0.04);
        osc.stop(now + 0.38);
      });
    } else {
      // Deep gravitic pile-bunker buildup for Anchor Slam / Sovereign Purge Wave
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(95, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.44);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.46);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx));
      osc.start(now);
      osc.stop(now + 0.48);
    }
  }

  private playBossAttackStrike(attack: BossAttackType): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (
      attack === 'vector_ram' ||
      attack === 'surgical_incision' ||
      attack === 'directive_lance' ||
      attack === 'archive_lance'
    ) {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(attack === 'directive_lance' ? 280 : 240, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.24);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx));
      osc.start(now);
      osc.stop(now + 0.27);
    } else if (
      attack === 'helical_sweep' ||
      attack === 'temporal_convergence_grid' ||
      attack === 'reconstructed_sweep'
    ) {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(attack === 'temporal_convergence_grid' ? 360 : 320, now);
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.2);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx));
      osc.start(now);
      osc.stop(now + 0.23);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(145, now);
      osc.frequency.exponentialRampToValueAtTime(36, now + 0.32);
      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx));
      osc.start(now);
      osc.stop(now + 0.35);
    }
  }

  private playBossShockwaveBurst(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(95, now + 0.28);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.31);
  }

  private playBossCoreExposed(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 783.99];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      gain.gain.setValueAtTime(0.11, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.22);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx));
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.24);
    });
  }

  private playBossPhaseTransition(): void {
    const ctx = this.ensureContext('music');
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [146.83, 220, 293.66, 440, 587.33];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.18, now + idx * 0.06 + 0.35);
      gain.gain.setValueAtTime(0.15, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.38);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx, 'music'));
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.4);
    });
  }

  private playBossDefeated(): void {
    const ctx = this.ensureContext('music');
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [329.63, 246.94, 164.81, 110, 73.42];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.65, now + idx * 0.08 + 0.36);
      gain.gain.setValueAtTime(0.16, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.38);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx, 'music'));
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.4);
    });
  }

  private playChoirNodePrimed(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.035);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.12, now + idx * 0.035 + 0.24);
      gain.gain.setValueAtTime(0.13, now + idx * 0.035);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.035 + 0.26);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx));
      osc.start(now + idx * 0.035);
      osc.stop(now + idx * 0.035 + 0.28);
    });
  }

  private playChoirSyncCompleted(): void {
    const ctx = this.ensureContext('music');
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      gain.gain.setValueAtTime(0.14, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.34);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx, 'music'));
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.36);
    });
  }

  private playGravityPinActivated(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(88, now + 0.26);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.3);
  }

  private playSiphonFluxDrained(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(560, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.22);
    gain.gain.setValueAtTime(0.13, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.25);
  }

  private playChronoSeverWarning(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqs = [620, 310];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.65, now + idx * 0.05 + 0.2);
      gain.gain.setValueAtTime(0.12, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.22);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx));
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.24);
    });
  }

  private playEchoCollapseDetonated(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(360, now);
    osc.frequency.exponentialRampToValueAtTime(48, now + 0.32);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.36);
  }

  private playLoomEndingSelected(): void {
    const ctx = this.ensureContext('music');
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [261.63, 392.0, 523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.15, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.55);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx, 'music'));
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.58);
    });
  }

  public playArchiveLogSample(speaker?: string, classification?: string): void {
    if (this.muted) return;
    this.playCommsTransmission(speaker, classification);
  }

  private playCommsTransmission(speaker?: string, classification?: string): void {
    try {
      const ctx = this.ensureContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const spk = (speaker ?? '').toUpperCase();
      const cls = (classification ?? '').toUpperCase();
      const isWarden = cls === 'LIVE WARDEN DIRECTIVE' || (spk.includes('WARDEN') && !spk.includes('PRIME'));
      const isLysa = spk.includes('LYSA');

      // Subtle radio squelch burst to anchor diegetic transmission onset
      const bufferSize = Math.floor(ctx.sampleRate * 0.06);
      const noiseBuf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuf;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(isWarden ? 950 : 1850, now);
      bp.Q.setValueAtTime(2.6, now);
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.032, now);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      noise.connect(bp);
      bp.connect(nGain);
      nGain.connect(this.getOutputNode(ctx));
      noise.start(now);

      const tones = isWarden
        ? [392.0, 293.66, 220.0]
        : isLysa
          ? [523.25, 659.25, 783.99]
          : [740, 987.77];

      tones.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = isWarden ? 'sawtooth' : 'sine';
        const step = isWarden ? 0.065 : 0.055;
        osc.frequency.setValueAtTime(freq, now + idx * step);
        if (isWarden) {
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1100, now + idx * step);
          gain.gain.setValueAtTime(0.042, now + idx * step);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * step + 0.16);
          osc.connect(filter);
          filter.connect(gain);
        } else {
          gain.gain.setValueAtTime(0.052, now + idx * step);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * step + 0.14);
          osc.connect(gain);
        }
        gain.connect(this.getOutputNode(ctx));
        osc.start(now + idx * step);
        osc.stop(now + idx * step + 0.18);
      });
    } catch {
      // Never block gameplay if Web Audio scheduling fails
    }
  }

  private playLockOnPing(engaged: boolean): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    if (engaged) {
      osc.frequency.setValueAtTime(640, now);
      osc.frequency.exponentialRampToValueAtTime(1120, now + 0.065);
    } else {
      osc.frequency.setValueAtTime(760, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.065);
    }
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.075, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.1);
  }

  private playChronoExecutionFinisher(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Deep sub impact drop
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'triangle';
    sub.frequency.setValueAtTime(175, now);
    sub.frequency.exponentialRampToValueAtTime(38, now + 0.32);
    subGain.gain.setValueAtTime(0.001, now);
    subGain.gain.linearRampToValueAtTime(0.28, now + 0.014);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
    sub.connect(subGain);
    subGain.connect(this.getOutputNode(ctx));
    sub.start(now);
    sub.stop(now + 0.38);

    // Crystalline execution harmonic slash chime
    const chime = ctx.createOscillator();
    const chimeGain = ctx.createGain();
    chime.type = 'sawtooth';
    chime.frequency.setValueAtTime(980, now + 0.02);
    chime.frequency.exponentialRampToValueAtTime(490, now + 0.24);
    chimeGain.gain.setValueAtTime(0.001, now + 0.02);
    chimeGain.gain.linearRampToValueAtTime(0.14, now + 0.04);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    chime.connect(chimeGain);
    chimeGain.connect(this.getOutputNode(ctx));
    chime.start(now + 0.02);
    chime.stop(now + 0.3);
  }

  public updateAmbientPulse(dt: number, state: AmbientMixState): void {
    if (this.disposed || this.muted || state.appState !== 'playing') {
      return;
    }
    if (this.getEffectiveBusScale('music') <= 0.001) {
      return;
    }
    if (!this.ctx || this.ctx.state !== 'running') {
      return;
    }

    const safeDt = Number.isFinite(dt) ? Math.max(0, Math.min(0.1, dt)) : 0;
    this.ambientPulseTimer -= safeDt;
    if (this.ambientPulseTimer > 0) {
      return;
    }

    const voice = computeAmbientPulseVoice(state, this.ambientStepIndex);
    this.ambientStepIndex += 1;
    if (!voice) {
      this.ambientPulseTimer = 0.5;
      return;
    }
    this.ambientPulseTimer = voice.intervalSec;

    try {
      const ctx = this.ctx;
      const now = ctx.currentTime;
      const out = this.getOutputNode(ctx, 'music');

      const triggerVoice = (
        freq: number,
        peakGain: number,
        dur: number,
        type: OscillatorType
      ) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.0005, now);
        gain.gain.linearRampToValueAtTime(peakGain, now + Math.min(0.08, dur * 0.22));
        gain.gain.exponentialRampToValueAtTime(0.0005, now + dur);
        osc.connect(gain);
        gain.connect(out);
        osc.start(now);
        osc.stop(now + dur + 0.02);
      };

      triggerVoice(voice.bassFreq, voice.bassGain, voice.durationSec, voice.waveform);
      triggerVoice(voice.padFreq, voice.padGain, voice.durationSec * 0.92, 'sine');
      if (voice.shimmerFreq !== null) {
        triggerVoice(voice.shimmerFreq, voice.shimmerGain, voice.durationSec * 0.65, 'sine');
      }
    } catch {
      // Never block gameplay if Web Audio scheduling fails
    }
  }

  private playBossCoreOmegaAwakened(): void {
    const ctx = this.ensureContext();
    if (!ctx || this.muted || !this.sfxGain) return;
    try {
      const now = ctx.currentTime;
      const notes = [330, 495, 660, 990];
      for (let i = 0; i < notes.length; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = i === notes.length - 1 ? 'sine' : 'triangle';
        const start = now + i * 0.045;
        osc.frequency.setValueAtTime(notes[i], start);
        osc.frequency.exponentialRampToValueAtTime(notes[i] * 1.03, start + 0.45);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(0.14 - i * 0.02, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.52);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
        osc.start(start);
        osc.stop(start + 0.54);
      }
    } catch {
      // Ignore Web Audio errors
    }
  }

  private playConfluenceBurstTriggered(): void {
    const ctx = this.ensureContext();
    if (!ctx || this.muted || !this.sfxGain) return;
    try {
      const now = ctx.currentTime;
      // Sub-bass shockwave drop
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sawtooth';
      subOsc.frequency.setValueAtTime(150, now);
      subOsc.frequency.exponentialRampToValueAtTime(46, now + 0.36);
      subGain.gain.setValueAtTime(0.0001, now);
      subGain.gain.linearRampToValueAtTime(0.18, now + 0.012);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
      subOsc.connect(subGain);
      subGain.connect(this.sfxGain);
      subOsc.onended = () => {
        subOsc.disconnect();
        subGain.disconnect();
      };
      subOsc.start(now);
      subOsc.stop(now + 0.44);

      // Crystalline harmonic triad
      const chord = [528, 792, 1056];
      for (let i = 0; i < chord.length; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = i === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(chord[i], now);
        osc.frequency.exponentialRampToValueAtTime(chord[i] * 1.06, now + 0.42);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.11, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
        osc.start(now);
        osc.stop(now + 0.5);
      }
    } catch {
      // Ignore Web Audio errors
    }
  }

  private playHoloMemoryProjected(): void {
    const ctx = this.ctx;
    const dest = this.sfxGain;
    if (!ctx || !dest || this.muted || this.disposed) return;
    try {
      const now = ctx.currentTime;
      // Crystalline choral harmonic arpeggio (C#5 - F5 - G#5 - C#6)
      const notes = [554.37, 698.46, 830.61, 1108.73];
      for (let i = 0; i < notes.length; i++) {
        const start = now + i * 0.065;
        const osc = ctx.createOscillator();
        const shimmer = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        shimmer.type = 'triangle';
        osc.frequency.setValueAtTime(notes[i], start);
        shimmer.frequency.setValueAtTime(notes[i] * 2.0, start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(0.085, start + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0008, start + 0.52);
        osc.connect(gain);
        shimmer.connect(gain);
        gain.connect(dest);
        osc.onended = () => {
          osc.disconnect();
          shimmer.disconnect();
          gain.disconnect();
        };
        osc.start(start);
        shimmer.start(start);
        osc.stop(start + 0.54);
        shimmer.stop(start + 0.54);
      }
    } catch {
      // Ignore Web Audio errors
    }
  }

  public dispose(): void {
    this.disposed = true;
    if (this.sfxGain) {
      try {
        this.sfxGain.disconnect();
      } catch {
        // Ignore disconnect errors on teardown
      }
      this.sfxGain = null;
    }
    if (this.musicGain) {
      try {
        this.musicGain.disconnect();
      } catch {
        // Ignore disconnect errors on teardown
      }
      this.musicGain = null;
    }
    if (this.masterGain) {
      try {
        this.masterGain.disconnect();
      } catch {
        // Ignore disconnect errors on teardown
      }
      this.masterGain = null;
    }
    if (this.ctx) {
      const currentCtx = this.ctx;
      this.ctx = null;
      try {
        void currentCtx.close();
      } catch {
        // Ignore AudioContext close errors on teardown
      }
    }
  }
}


