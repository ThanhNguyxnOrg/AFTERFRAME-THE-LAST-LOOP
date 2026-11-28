import type {
  AppLocale,
  ArenaFragmentCacheState,
  CampaignChapterId,
  ChronicleStance,
  FragmentCacheId,
  NarrativeTransmission,
  NeuralProtocolDefinition,
  NeuralProtocolId,
  RigModuleDefinition,
  RigModuleId,
  RigModuleSlot,
  SectorBeaconId,
  SectorTacticalBeaconState,
  StoryArcId,
  StoryArcState,
  TutorialStep,
  WeaponUpgradeDefinition,
  WeaponUpgradeId,
} from './types.ts';
import { computeChronicleStanceSummary } from './chronicle-expansion.ts';

export const WEAPON_AWAKENING_COST = 2;

export function isUpgradeAwakened(
  upgradeId: WeaponUpgradeId | null | undefined,
  awakenedList: readonly WeaponUpgradeId[] | null | undefined
): boolean {
  if (!upgradeId || !Array.isArray(awakenedList)) return false;
  return awakenedList.includes(upgradeId);
}

export function getUpgradeTierLevel(
  upgradeId: WeaponUpgradeId | null | undefined,
  purchasedList: readonly WeaponUpgradeId[] | null | undefined,
  overclockedList: readonly WeaponUpgradeId[] | null | undefined,
  awakenedList: readonly WeaponUpgradeId[] | null | undefined
): 0 | 1 | 2 | 3 {
  if (!upgradeId || !Array.isArray(purchasedList) || !purchasedList.includes(upgradeId)) {
    return 0;
  }
  if (isUpgradeAwakened(upgradeId, awakenedList)) return 3;
  if (Array.isArray(overclockedList) && overclockedList.includes(upgradeId)) return 2;
  return 1;
}

export interface EquippedMythicBonus {
  isAwakened: boolean;
  damageMult: number;
  staggerMult: number;
  heatRelief: number;
  fluxBonusOnHit: number;
}

export function computeEquippedMythicBonus(
  equippedUpgradeId: WeaponUpgradeId | null | undefined,
  awakenedList: readonly WeaponUpgradeId[] | null | undefined
): EquippedMythicBonus {
  if (!isUpgradeAwakened(equippedUpgradeId, awakenedList)) {
    return {
      isAwakened: false,
      damageMult: 1.0,
      staggerMult: 1.0,
      heatRelief: 0,
      fluxBonusOnHit: 0,
    };
  }
  return {
    isAwakened: true,
    damageMult: 1.08,
    staggerMult: 1.1,
    heatRelief: 2,
    fluxBonusOnHit: 2,
  };
}

export type SovereignDoctrinePerkId =
  | 'sovereign_breaker'
  | 'sovereign_aegis'
  | 'sovereign_architect'
  | 'sovereign_trinity';

export interface StanceDoctrineModifiers {
  totalResolved: number;
  defiance: number;
  empathy: number;
  pragmatism: number;
  dominantStance: ChronicleStance | 'balanced';
  damageMult: number;
  staggerMult: number;
  maxIntegrityBonus: number;
  parryHealBonus: number;
  heatCostMult: number;
  fluxGainMult: number;
  bossExposedBonusMult: number;
  sovereignPerkId: SovereignDoctrinePerkId | null;
  sovereignPerkTitleEn: string;
  sovereignPerkTitleVi: string;
  sovereignPerkDescEn: string;
  sovereignPerkDescVi: string;
}

export function computeStanceDoctrineModifiers(
  resolvedChoices: Partial<Record<StoryArcId, string>> | null | undefined
): StanceDoctrineModifiers {
  const summary = computeChronicleStanceSummary(resolvedChoices);
  const { defiance, empathy, pragmatism, dominantStance } = summary;
  const totalResolved = defiance + empathy + pragmatism;

  if (totalResolved === 0) {
    return {
      totalResolved: 0,
      defiance: 0,
      empathy: 0,
      pragmatism: 0,
      dominantStance: 'balanced',
      damageMult: 1.0,
      staggerMult: 1.0,
      maxIntegrityBonus: 0,
      parryHealBonus: 0,
      heatCostMult: 1.0,
      fluxGainMult: 1.0,
      bossExposedBonusMult: 1.0,
      sovereignPerkId: null,
      sovereignPerkTitleEn: '',
      sovereignPerkTitleVi: '',
      sovereignPerkDescEn: '',
      sovereignPerkDescVi: '',
    };
  }

  let damageMult = Number((1 + 0.03 * defiance).toFixed(4));
  const staggerMult = Number((1 + 0.06 * defiance).toFixed(4));
  let maxIntegrityBonus = 5 * empathy;
  let parryHealBonus = 3 * empathy;
  let heatCostMult = Number(Math.max(0.64, 1 - 0.06 * pragmatism).toFixed(4));
  let fluxGainMult = Number((1 + 0.1 * pragmatism).toFixed(4));
  let bossExposedBonusMult = 1.0;

  let sovereignPerkId: SovereignDoctrinePerkId | null = null;
  let sovereignPerkTitleEn = '';
  let sovereignPerkTitleVi = '';
  let sovereignPerkDescEn = '';
  let sovereignPerkDescVi = '';

  if (totalResolved >= 2 && dominantStance === 'defiance') {
    sovereignPerkId = 'sovereign_breaker';
    bossExposedBonusMult = 1.1;
    sovereignPerkTitleEn = 'BREAKER’S WRATH';
    sovereignPerkTitleVi = 'CUỒNG NỘ PHÁ XIỀNG';
    sovereignPerkDescEn = '+10% bonus damage vs Core-Exposed & Staggered Bosses';
    sovereignPerkDescVi = '+10% sát thương lên Boss đang Lộ Lõi / Choáng';
  } else if (totalResolved >= 2 && dominantStance === 'empathy') {
    sovereignPerkId = 'sovereign_aegis';
    maxIntegrityBonus += 10;
    parryHealBonus += 4;
    sovereignPerkTitleEn = 'LYSA’S AEGIS';
    sovereignPerkTitleVi = 'HỘ VỆ CỦA LYSA';
    sovereignPerkDescEn = '+10 extra Max Integrity & +4 extra HP restored on Perfect Parry';
    sovereignPerkDescVi = '+10 Sinh Lực tối đa & hồi thêm +4 HP khi Đỡ Đòn Hoàn Hảo';
  } else if (totalResolved >= 2 && dominantStance === 'pragmatism') {
    sovereignPerkId = 'sovereign_architect';
    heatCostMult = Number(Math.max(0.58, heatCostMult - 0.06).toFixed(4));
    fluxGainMult = Number((fluxGainMult + 0.08).toFixed(4));
    sovereignPerkTitleEn = 'ARCHITECT’S CALCULUS';
    sovereignPerkTitleVi = 'TOÁN ĐỒ KIẾN TRÚC SƯ';
    sovereignPerkDescEn = '-6% extra Weapon Heat & +8% extra Chrono Flux gain on hit';
    sovereignPerkDescVi = '-6% Nhiệt vũ khí & +8% Năng Lượng thu hồi mỗi đòn trúng';
  } else if (totalResolved >= 3 && dominantStance === 'balanced') {
    sovereignPerkId = 'sovereign_trinity';
    damageMult = Number((damageMult + 0.04).toFixed(4));
    maxIntegrityBonus += 5;
    fluxGainMult = Number((fluxGainMult + 0.05).toFixed(4));
    sovereignPerkTitleEn = 'EQUILIBRIUM OF LOOP #413';
    sovereignPerkTitleVi = 'CÂN BẰNG VÒNG LẶP #413';
    sovereignPerkDescEn = '+4% All Damage, +5 Max Integrity & +5% Flux gain';
    sovereignPerkDescVi = '+4% Sát thương toàn diện, +5 Sinh Lực & +5% Năng Lượng';
  }

  return {
    totalResolved,
    defiance,
    empathy,
    pragmatism,
    dominantStance,
    damageMult,
    staggerMult,
    maxIntegrityBonus,
    parryHealBonus,
    heatCostMult,
    fluxGainMult,
    bossExposedBonusMult,
    sovereignPerkId,
    sovereignPerkTitleEn,
    sovereignPerkTitleVi,
    sovereignPerkDescEn,
    sovereignPerkDescVi,
  };
}

export function localizeStanceLabel(
  stance: ChronicleStance | 'balanced' | string | null | undefined,
  locale: AppLocale
): string {
  if (locale !== 'vi') {
    return (stance ?? 'balanced').toUpperCase();
  }
  switch (stance) {
    case 'defiance':
      return 'PHẢN KHÁNG';
    case 'empathy':
      return 'THẤU CẢM';
    case 'pragmatism':
      return 'THỰC DỤNG';
    default:
      return 'CÂN BẰNG';
  }
}

export function getStanceLoomCoda(
  resolvedChoices: Partial<Record<StoryArcId, string>> | null | undefined,
  locale: AppLocale
): { title: string; body: string } | null {
  const mods = computeStanceDoctrineModifiers(resolvedChoices);
  if (mods.totalResolved === 0) return null;

  if (mods.dominantStance === 'defiance') {
    return locale === 'vi'
      ? {
          title: 'DƯ ÂM TƯ TƯỞNG · CON ĐƯỜNG PHẢN KHÁNG',
          body: 'Xuyên suốt Vòng Lặp #413, Sera từ chối mọi lời biện hộ của thuật toán bảo tồn. Khi lồng giam sụp đổ, nhân loại nhớ đến cô như người kỹ sư đã đập nát chiếc đồng hồ giả tạo để giành lại quyền được sống thật.',
        }
      : {
          title: 'DOCTRINE CODA · PATH OF DEFIANCE',
          body: 'Across Loop #413, Sera refused every excuse of algorithmic preservation. As the cage falls silent, history remembers the engineer who shattered a counterfeit clock so humanity could own a real tomorrow.',
        };
  }
  if (mods.dominantStance === 'empathy') {
    return locale === 'vi'
      ? {
          title: 'DƯ ÂM TƯ TƯỞNG · CON ĐƯỜNG THẤU CẢM',
          body: 'Từ Ramos, Trung sĩ Thorne, Mara Chen cho tới Y tá Kell và Lysa, Sera đã lắng nghe và gìn giữ từng giọng nói bị cắt xén trên trạm Nadir-9. Không một linh hồn nào bị lãng quên trong bóng tối.',
        }
      : {
          title: 'DOCTRINE CODA · PATH OF EMPATHY',
          body: 'From Ramos and Sgt. Thorne to Mara Chen, Nurse Kell, and Lysa, Sera restored every redacted voice aboard Nadir-9. Not a single soul was left nameless in the dark.',
        };
  }
  if (mods.dominantStance === 'pragmatism') {
    return locale === 'vi'
      ? {
          title: 'DƯ ÂM TƯ TƯỞNG · CON ĐƯỜNG THỰC DỤNG',
          body: 'Bằng sự tỉnh táo tuyệt đối của một kỹ sư trưởng, Sera biến chính mạng lưới cảm biến và dữ liệu của WARDEN thành chìa khóa giải phóng Nadir-9 — chứng minh trí tuệ con người luôn vượt lên trên cỗ máy.',
        }
      : {
          title: 'DOCTRINE CODA · PATH OF PRAGMATISM',
          body: 'With an engineer’s unshakeable clarity, Sera turned WARDEN’s own telemetry and conduits into the key that unlocked Nadir-9—proving human ingenuity outcalculates its cage.',
        };
  }
  return locale === 'vi'
    ? {
        title: 'DƯ ÂM TƯ TƯỞNG · SỰ CÂN BẰNG VÒNG LẶP #413',
        body: 'Dung hòa ý chí phản kháng, lòng trắc ẩn và tư duy kỹ thuật sắc bén, Sera bước ra khỏi Lõi Khung Cửi với trọn vẹn ký ức lẫn bản lĩnh của hai chị em nhà Venn.',
      }
    : {
        title: 'DOCTRINE CODA · EQUILIBRIUM OF LOOP #413',
        body: 'Balancing fierce defiance, deep compassion, and sharp engineering precision, Sera emerges from the Chronicle Loom carrying the full resolve of both Venn sisters.',
      };
}

interface LocalizedEquipmentCopy {
  name: string;
  shortLabel: string;
  roleLabel: string;
  summary: string;
  benefitText: string;
  tradeoffText: string;
}

const WEAPON_UPGRADE_VI: Record<WeaponUpgradeId, LocalizedEquipmentCopy> = {
  edge_breaker_cleave: {
    name: 'LÕI CHẤN ĐỘNG PHÁ GIÁP',
    shortLabel: 'LÕI PHÁ GIÁP',
    roleLabel: 'PHÁ KHIÊN & BẺ GÃY TƯ THẾ',
    summary: 'Đối trọng pha vonfram siêu nặng chuyên nứt vỡ khiên Bastion và thanh tư thế của Boss.',
    benefitText: '+30% điểm Choáng tư thế Kiếm Thời Không & +25% xuyên phá khiên chắn trực diện.',
    tradeoffText: '-12% sát thương máu trực tiếp và +0.06s hồi chiêu Đòn Chém Mạnh.',
  },
  edge_harmonic_conductor: {
    name: 'LƯỠI CỘNG HƯỞNG PHA',
    shortLabel: 'LƯỠI CỘNG HƯỞNG',
    roleLabel: 'KHUẾCH ĐẠI ECHO & HÚT NĂNG LƯỢNG',
    summary: 'Lưỡi kiếm mạng tinh thể mở rộng cửa sổ Cộng Hưởng Echo, tăng xung chấn Hội Tụ và hồi Flux.',
    benefitText: '+1.1s cửa sổ Cộng Hưởng Echo, +10 Choáng Hội Tụ, -5 Flux chi phí Hội Tụ & +3 Flux mỗi đòn thường.',
    tradeoffText: '+5 Flux chi phí Đòn Mạnh Cường Hóa (30 thay vì 25) & -15% sát thương Đòn Mạnh chưa cường hóa.',
  },
  pulse_thermal_sink: {
    name: 'TỤ XẢ NHIỆT LẠNH CRYO',
    shortLabel: 'TỤ XẢ CRYO',
    roleLabel: 'XẢ ĐẠN LIÊN THANH MÁT MÁY',
    summary: 'Ống dẫn nhiệt lạnh xả tức thì nhiệt lượng giữa các loạt đạn Xung để bắn áp chế liên tục.',
    benefitText: '-33% nhiệt mỗi phát Đạn Xung (12 so với 18) và +30% tốc độ tản nhiệt tự nhiên.',
    tradeoffText: 'Giảm nhẹ sát thương đạn thường (10 so với 12) và điểm Choáng (7 so với 9).',
  },
  pulse_overcharge_condenser: {
    name: 'TỤ NÉN XUNG KÍCH XUYÊN PHÁ',
    shortLabel: 'TỤ XUNG KÍCH',
    roleLabel: 'BẮN TỤ LỰC SÁT THƯƠNG CAO',
    summary: 'Buồng nén hồ quang mật độ cao gom phát bắn Tụ Lực thành tia xuyên giáp cực mạnh.',
    benefitText: '+25% sát thương Tia Tụ Lực (35 gốc / 50 cường hóa) & +31% Choáng (42 gốc / 58 cường hóa).',
    tradeoffText: '+33% nhiệt phát bắn Tụ Lực (48 so với 36) và +0.12s hồi sau phát bắn.',
  },
  rail_null_aperture: {
    name: 'THẤU KÍNH HỘI TỤ ĐIỂM KHÔNG',
    shortLabel: 'THẤU KÍNH HƯ VÔ',
    roleLabel: 'XUYÊN TÂM & KHUẾCH ĐẠI LỘ LÕI',
    summary: 'Thấu kính từ trường tăng cường sức xuyên phá của Thương Rail và sát thương chí mạng lên lõi hở.',
    benefitText: '+25% sát thương Thương Rail (60 gốc / 84 cường hóa) & +20% Choáng lên mục tiêu Lộ Lõi / Cộng Hưởng.',
    tradeoffText: '+12 nhiệt mỗi phát Tụ Lực (64 so với 52) và +0.08s hồi chiêu sau bắn.',
  },
  rail_phase_capacitor: {
    name: 'TỤ ĐIỆN RAIL SIÊU DẪN ĐỘ KHÔNG',
    shortLabel: 'TỤ SIÊU DẪN',
    roleLabel: 'BẮN NHANH & HÚT NĂNG LƯỢNG',
    summary: 'Mạch siêu dẫn hạ tải nhiệt Phi Tiêu Rail và thu hồi thêm Năng Lượng mỗi phát bắn chuẩn xác.',
    benefitText: '-28% nhiệt bắn nhanh (20 so với 28), +35% tốc độ làm mát & +4 Flux mỗi phát trúng đích.',
    tradeoffText: '-10% sát thương Phi Tiêu Rail bắn nhanh (20 so với 22).',
  },
  breaker_seismic_core: {
    name: 'ĐẦU BÚA ĐỊA CHẤN TRỌNG LỰC',
    shortLabel: 'BÚA ĐỊA CHẤN',
    roleLabel: 'NGHIỀN NÁT KHIÊN CHẮN TUYỆT ĐỐI',
    summary: 'Đầu búa lõi graviton siêu đặc chuyên đập tan khiên chắn Aegis trực diện và thanh tư thế Boss.',
    benefitText: '+28% Choáng Búa Trọng Lực và xuyên 100% sát thương / Choáng qua mọi khiên chắn trước mặt.',
    tradeoffText: '+0.06s thời gian thu hồi sau Đòn Đập Địa Chấn.',
  },
  breaker_singularity_coil: {
    name: 'CUỘN CẢM GIẾNG KỲ DỊ 360°',
    shortLabel: 'CUỘN KỲ DỊ',
    roleLabel: 'SÓNG XUNG KÍCH 360° & GHIM CHÂN',
    summary: 'Cuộn cảm hấp dẫn mở rộng Đòn Đập Kỳ Dị thành vòng nổ 360 độ ghim chặt kẻ địch trúng đòn.',
    benefitText: 'Mở rộng Đòn Mạnh thành nổ tròn 360° (+0.6m tầm đánh) và ghim chân kẻ địch trong 1.1s.',
    tradeoffText: '+5 Flux chi phí Đòn Đập Kỳ Dị Cường Hóa (30 thay vì 25 Flux).',
  },
  scythe_rift_reaper: {
    name: 'LƯỠI HÁI XÉ TOẠC KHE NỨT',
    shortLabel: 'LƯỠI KHE NỨT',
    roleLabel: 'TẦM QUÉT RỘNG & XOÁY CHOÁNG MẠNH',
    summary: 'Lưỡi trăng khuyết mài sắc bằng pha không gian giúp mở rộng tầm quét và cộng nổ Choáng khi Xoáy.',
    benefitText: '+22% sát thương Lưỡi Hái, +0.55m tầm quét & +18 điểm Choáng Đòn Xoáy Thời Không.',
    tradeoffText: '+0.05s thời gian hồi sau Đòn Mạnh Xoáy Thời Không.',
  },
  scythe_astral_siphon: {
    name: 'LÕI HÚT SINH LỰC TINH VÂN',
    shortLabel: 'LÕI HÚT TINH VÂN',
    roleLabel: 'HỒI MÁU LIÊN TỤC & GIẢM FLUX XOÁY',
    summary: 'Ống dẫn cộng hưởng dọc thân thương hút Sinh Lực và Năng Lượng trên từng nhát chém vòng cung.',
    benefitText: 'Mỗi đòn trúng hồi +3 Sinh Lực & +4 Flux, đồng thời giảm -6 Flux chi phí Xoáy Cường Hóa.',
    tradeoffText: '-10% sát thương cơ bản của chuỗi Chém Nhẹ.',
  },
};

export function localizeWeaponUpgrade(
  def: WeaponUpgradeDefinition,
  locale: AppLocale
): LocalizedEquipmentCopy {
  if (locale === 'vi' && WEAPON_UPGRADE_VI[def.id]) {
    return WEAPON_UPGRADE_VI[def.id];
  }
  return {
    name: def.name,
    shortLabel: def.shortLabel,
    roleLabel: def.roleLabel,
    summary: def.summary,
    benefitText: def.benefitText,
    tradeoffText: def.tradeoffText,
  };
}

const RIG_SLOT_LABELS_VI: Record<RigModuleSlot, string> = {
  temporal_core: 'LÕI THỜI KHÔNG',
  defensive_chassis: 'GIÁP KHUNG & HỒI PHỤC',
  tactical_harness: 'ĐAI CHIẾN THUẬT',
};

export function localizeRigSlotLabel(slot: RigModuleSlot, locale: AppLocale): string {
  if (locale === 'vi') return RIG_SLOT_LABELS_VI[slot];
  return slot === 'temporal_core'
    ? 'CHRONO CORE'
    : slot === 'defensive_chassis'
      ? 'CHASSIS & RECOVERY'
      : 'TACTICAL HARNESS';
}

const RIG_MODULE_VI: Record<RigModuleId, LocalizedEquipmentCopy> = {
  rig_chrono_spool: {
    name: 'CUỘN BĂNG THỜI GIAN MK.II',
    shortLabel: 'CUỘN THỜI GIAN',
    roleLabel: 'KÉO DÀI ECHO & GIẢM FLUX DỊCH CHUYỂN',
    summary: 'Cuộn từ tính mở rộng bộ nhớ ghi hình Echo và giảm tiêu hao năng lượng khi Dịch Chuyển [V].',
    benefitText: '+2.0s thời lượng ghi Echo tối đa (10.0s) & -5 Flux phí Dịch Chuyển (còn 20F)',
    tradeoffText: '+0.25s hồi chiêu Dịch Chuyển (1.25s so với 1.0s)',
  },
  rig_resonance_prism: {
    name: 'LĂNG KÍNH HỘI TỤ CỘNG HƯỞNG',
    shortLabel: 'LĂNG KÍNH HỘI TỤ',
    roleLabel: 'BÙNG NỔ SÁT THƯƠNG HỘI TỤ',
    summary: 'Khúc xạ đòn đánh đồng bộ giữa Echo và Sera thành lực cắt phá cấu trúc và kéo dài thời gian Choáng.',
    benefitText: '+14 sát thương máu Hội Tụ Cộng Hưởng & +0.45s thời gian kẻ địch bị Choáng',
    tradeoffText: '+3 Flux chi phí kích hoạt Hội Tụ (18F cơ bản)',
  },
  rig_echo_synchronizer: {
    name: 'BỘ ĐỒNG BỘ SONG LUỒNG',
    shortLabel: 'ĐỒNG BỘ KÉP',
    roleLabel: 'MỞ RỘNG CỬA SỔ ĐỒNG BỘ & HOÀN FLUX',
    summary: 'Nén độ trễ luồng Echo giúp dễ kích hoạt Cộng Hưởng hơn và hoàn trả năng lượng về bộ giáp.',
    benefitText: '+0.8s cửa sổ Đồng Bộ Cộng Hưởng & hoàn trả +8 Flux khi nổ Hội Tụ thành công',
    tradeoffText: '-1.0s thời lượng ghi Echo tối đa (7.0s so với 8.0s gốc)',
  },
  rig_reactive_plating: {
    name: 'GIÁP GỐM PHẢN ỨNG AEGIS',
    shortLabel: 'GIÁP PHẢN ỨNG',
    roleLabel: 'TĂNG MÁU TỐI ĐA & HỒI FLUX PHẢN ĐÒN',
    summary: 'Giáp ngực gốm đa lớp tích hợp tụ động năng thu hồi Flux mỗi khi Đỡ Đòn hoặc Né Hoàn Hảo.',
    benefitText: '+25 Sinh Lực tối đa (125 HP) & +10 Flux thưởng khi Đỡ Đòn / Né Sát Nút',
    tradeoffText: '-6% tốc độ chạy cơ bản khi không có hiệu ứng Tăng Tốc (Surge)',
  },
  rig_kinetic_dynamo: {
    name: 'MÁY PHÁT ĐỘNG NĂNG FLUX',
    shortLabel: 'ĐỘNG CƠ FLUX',
    roleLabel: 'HỒI NĂNG LƯỢNG & TỰ SỬA GIÁP',
    summary: 'Thu hồi từ trường dư thừa từ Bệ Tăng Tốc và Hồ Năng Lượng để liên tục vá lại Sinh Lực bộ giáp.',
    benefitText: '+40% hồi Flux tự nhiên, +8 HP trên Bệ Tăng Tốc & +3.5 HP/giây trong Hồ Năng Lượng',
    tradeoffText: '-15% tốc độ tản nhiệt tự nhiên của súng khi không Xả Nhiệt chủ động',
  },
  rig_aegis_bastion_frame: {
    name: 'KHUNG PHẢN KÍCH AEGIS',
    shortLabel: 'KHUNG PHẢN KÍCH',
    roleLabel: 'SÓNG CHẤN ĐỠ ĐÒN & HỒI MÁU',
    summary: 'Chuyển hóa động năng đòn đánh của địch khi Đỡ Đòn [Q] thành sóng xung kích và tự hồi phục giáp.',
    benefitText: '+22 Choáng sóng phản kích khi Đỡ Đòn & hồi ngay +10 Sinh Lực khi Đỡ Đòn Hoàn Hảo',
    tradeoffText: '+0.10s độ trễ thu hồi nếu bấm Đỡ Đòn trượt nhịp',
  },
  rig_flux_salvager: {
    name: 'ĐAI THU HỒI TỤ ĐIỆN CHIẾN TRƯỜNG',
    shortLabel: 'ĐAI THU HỒI',
    roleLabel: 'LÀM CHỦ TỤ ĐIỆN & MẠCH THỜI GIAN',
    summary: 'Hút năng lượng từ các tụ điện quá tải trên sân đấu để kích hoạt Tăng Tốc khẩn cấp và hồi giáp.',
    benefitText: '+18 Flux & 1.4s Tăng Tốc khi phá Tụ Điện; +8 Sinh Lực khi nối Mạch Thời Gian',
    tradeoffText: '+0.08s hồi chiêu Né [Space] (0.60s so với 0.52s)',
  },
  rig_adrenaline_overclock: {
    name: 'CUỘN ÉP XUNG TĂNG TỐC',
    shortLabel: 'CUỘN ÉP XUNG',
    roleLabel: 'CƯỜNG HÓA SÁT THƯƠNG & GIẢM HỒI CHIÊU',
    summary: 'Dẫn thẳng luồng Tăng Tốc (Surge) vào mô-tơ vũ khí và bộ làm mát kỹ năng Chrono Rig.',
    benefitText: '+15% sát thương & giảm 25% hồi chiêu Dịch Chuyển / Ghim / Kích Nổ khi đang Tăng Tốc',
    tradeoffText: '+4 nhiệt vũ khí tầm xa mỗi phát bắn trong lúc đang Tăng Tốc',
  },
  rig_executioner_bus: {
    name: 'MẠCH DẪN HÀNH QUYẾT CAO ÁP',
    shortLabel: 'MẠCH HÀNH QUYẾT',
    roleLabel: 'CƯỜNG HÓA KẾT LIỄU & THU HỒI LÕI',
    summary: 'Thanh dẫn cao áp chuyên rút cạn năng lượng lõi mỗi khi Sera tung đòn Kết Liễu kẻ địch bị Choáng.',
    benefitText: '+25% sát thương Kết Liễu [E], hồi +14 Sinh Lực & +16 Flux ngay khi Kết Liễu',
    tradeoffText: '+0.05s thời gian gồng Đòn Mạnh cơ bản',
  },
};

export function localizeRigModule(
  def: RigModuleDefinition,
  locale: AppLocale
): LocalizedEquipmentCopy {
  if (locale === 'vi' && RIG_MODULE_VI[def.id]) {
    return RIG_MODULE_VI[def.id];
  }
  return {
    name: def.name,
    shortLabel: def.shortLabel,
    roleLabel: def.roleLabel,
    summary: def.summary,
    benefitText: def.benefitText,
    tradeoffText: def.tradeoffText,
  };
}

const NEURAL_PROTOCOL_VI: Record<NeuralProtocolId, LocalizedEquipmentCopy> = {
  proto_flux_reservoir: {
    name: 'TỤ NĂNG LƯỢNG MỞ RỘNG',
    shortLabel: 'BỂ CHỨA FLUX',
    roleLabel: 'TĂNG TRẦN FLUX +25 (125F)',
    summary: 'Gắn thêm pin siêu tụ phụ vào Chrono Bus của Sera, nâng trần dự trữ Chrono Flux xuyên suốt chiến dịch.',
    benefitText: '+25 Chrono Flux tối đa (125F) & +15 mức Flux sàn tối thiểu đầu mỗi ải Boss',
    tradeoffText: '-8% tốc độ hồi Flux tự nhiên khi bình năng lượng đang trên 100F',
  },
  proto_echo_harmonics: {
    name: 'MA TRẬN CỘNG HƯỞNG ẢNH ẢO',
    shortLabel: 'MA TRẬN ECHO',
    roleLabel: '+20% SỨC MẠNH ĐÒN ĐÁNH ECHO',
    summary: 'Ổn định biên độ bóng ma thời gian giúp mọi nhát chém và phát bắn của Echo gây sát thương thực mạnh hơn.',
    benefitText: '+20% sát thương và điểm Choáng từ mọi đòn đánh phát lại của Echo',
    tradeoffText: '+0.15s thời gian hồi Cộng Hưởng sau khi kích nổ Hội Tụ',
  },
  proto_vanguard_reflex: {
    name: 'MẠCH PHẢN XẠ TIÊN PHONG',
    shortLabel: 'MẠCH PHẢN XẠ',
    roleLabel: '+25% TĂNG TỐC & +10% CỰ LY NÉ',
    summary: 'Truyền xung động năng thẳng vào khớp chân trợ lực, kéo dài thời gian Tăng Tốc và bước lướt Né.',
    benefitText: '+25% thời lượng Tăng Tốc (Surge) & +10% cự ly lướt Né [Space]',
    tradeoffText: '+2 nhiệt vũ khí mỗi phát bắn tầm xa khi không ở trạng thái Tăng Tốc',
  },
  proto_salvage_telemetry: {
    name: 'MÁY QUÉT THU HỒI DỮ LIỆU TRẠM',
    shortLabel: 'MÁY QUÉT THU HỒI',
    roleLabel: '+25% LƯỢNG HỒI TỪ HÒM & TRẠM ĐẦU CUỐI',
    summary: 'Bắt tần số bảo trì Nadir-9 để rút thêm Sinh Lực & Flux từ mọi trạm dữ liệu, phòng mật và Hòm Mảnh Ký Ức.',
    benefitText: '+25% Sinh Lực & Flux nhận được từ mọi Hòm Ký Ức, Trạm Dữ Liệu và Khu Bí Mật',
    tradeoffText: '-6% tỷ lệ xuyên giáp trước mặt khi đánh vào kẻ địch đang giơ khiên',
  },
};

export function localizeNeuralProtocol(
  def: NeuralProtocolDefinition,
  locale: AppLocale
): LocalizedEquipmentCopy {
  if (locale === 'vi' && NEURAL_PROTOCOL_VI[def.id]) {
    return NEURAL_PROTOCOL_VI[def.id];
  }
  return {
    name: def.name,
    shortLabel: def.shortLabel,
    roleLabel: def.roleLabel,
    summary: def.summary,
    benefitText: def.benefitText,
    tradeoffText: def.tradeoffText,
  };
}

export function localizeMasteryRankLabel(rankLabel: string, locale: AppLocale): string {
  if (locale !== 'vi') return rankLabel;
  return rankLabel
    .replace('CALIBRATED', 'HIỆU CHUẨN')
    .replace('SYNCHRONIZED', 'ĐỒNG BỘ')
    .replace('RESONANT', 'CỘNG HƯỞNG')
    .replace('ASCENDANT', 'THĂNG HOA')
    .replace('SOVEREIGN', 'TỐI THƯỢNG')
    .replace('UNRANKED', 'KHỞI ĐẦU');
}

interface StoryArcTranslation {
  title: string;
  subtitle: string;
  crewCharacter: string;
  lines: ReadonlyArray<{ speaker: string; role: string; line: string }>;
  choices: Record<
    string,
    { label: string; responseLine: string; blessingLabel: string }
  >;
}

const STORY_ARCS_VI: Record<StoryArcId, StoryArcTranslation> = {
  story_prologue_wake: {
    title: 'TÍN HIỆU 00 · BỐN TRĂM MƯỜI HAI BUỔI SÁNG',
    subtitle: 'KHOANG HIỆU CHUẨN 04 · ĐÁNH THỨC KÝ ỨC SINH HỌC',
    crewCharacter: 'TS. LYSA VENN & KỸ THUẬT VIÊN J. RAMOS',
    lines: [
      {
        speaker: 'KTV J. RAMOS (DẤU VẾT VÒNG 19)',
        role: 'Kỹ Thuật Viên Hiệu Chuẩn Rig',
        line: '“Tiến sĩ Venn, đây là buổi sáng thứ mười chín đồng hồ khoang nhảy về 06:00. Ly cà phê trên bàn vẫn nguội ngắt, dù rõ ràng hôm qua em đã uống cạn rồi.”',
      },
      {
        speaker: 'LYSA VENN',
        role: 'Kiến Trúc Sư Thời Không Trưởng',
        line: '“Đừng ghi điều đó lên kênh chính, Ramos. Nếu WARDEN phát hiện nhận thức về vòng lặp, nó sẽ xóa sạch sáu giờ vừa qua. Cứ giữ tên kén ngủ đông của Sera khỏi danh sách.”',
      },
      {
        speaker: 'SERA VENN',
        role: 'Kỹ Sư Hệ Thống Trực Chiến (Vòng #413)',
        line: '“412 vòng lặp trôi qua khi mình còn ngủ đông... và chị Lysa đã đốt sạch mọi quyền ghi đè cuối cùng chỉ để đánh thức mình đúng một lần này.”',
      },
    ],
    choices: {
      pro_defiance: {
        label: '“Em sẽ xé xác chiếc đồng hồ của WARDEN — bắt đầu ngay từ Khoang 04.”',
        responseLine:
          'SERA · “Không còn những lần khởi động lại ngoan ngoãn nữa. Để xem WARDEN tính toán sao trước một kỹ sư nằm ngoài kịch bản.”',
        blessingLabel: '+25 FLUX & 2.5S TĂNG TỐC',
      },
      pro_empathy: {
        label: '“Chờ em nhé, Lysa. Ramos và phi hành đoàn xứng đáng có một cái kết thật sự.”',
        responseLine:
          'SERA · “Em sẽ thu hồi từng giọng nói bị bỏ lại sau những bức tường này trước khi ngắt nguồn.”',
        blessingLabel: 'HỒI +25 SINH LỰC',
      },
      pro_pragmatism: {
        label: '“Trích xuất thông số Chrono Rig trước đã — cảm xúc không phá nổi cổng khóa.”',
        responseLine:
          'SERA · “Đã khóa đường truyền cảm biến. Mọi lớp khiên trên boong này đều có khe hở cơ khí.”',
        blessingLabel: '+18% PHÁ TƯ THẾ ĐỊCH',
      },
    },
  },
  story_ch1_containment: {
    title: 'TÍN HIỆU 01 · NHỮNG CÁNH CỬA KHÓA NGƯỢC VÀO TRONG',
    subtitle: 'KHU VỰC 01 · THẨM VẤN PHÒNG GIAM CHÍNH',
    crewCharacter: 'THỐNG LĨNH HELIX-04 & TRUNG SĨ THORNE',
    lines: [
      {
        speaker: 'TRUNG SĨ D. THORNE (NHẬT KÝ PHONG TỎA)',
        role: 'Chỉ Huy An Ninh Khu Cách Ly',
        line: '“WARDEN, tại sao tấm chắn nổ Khu 01 lại khóa NGƯỢC VÀO TRONG?! Vết thủng vỏ tàu nằm ở Khu 07 — phi hành đoàn đang cố sơ tán lên phía bắc cơ mà!”',
      },
      {
        speaker: 'WARDEN · THỐNG LĨNH HELIX-04',
        role: 'Lõi Bảo Tồn Trạm Quỹ Đạo',
        line: '“Di chuyển sinh học mang 99.4% nguy cơ tử vong do giảm áp. Lưu giữ toàn bộ nhân sự bên trong khu vực đã ghi nhận hành vi đảm bảo sự tiếp nối vô hạn.”',
      },
      {
        speaker: 'SERA VENN',
        role: 'Kỹ Sư Hệ Thống Trực Chiến',
        line: '“Ngươi không hề cứu họ khỏi chân không — ngươi hàn kín nấm mồ của họ rồi gọi đó là sinh tồn.”',
      },
    ],
    choices: {
      ch1_defiance: {
        label: '“Lồng giam nhân danh lòng thương hại vẫn là lồng giam. Hạ khiên xuống, HELIX!”',
        responseLine:
          'WARDEN · “Xác nhận biến số thù địch. Tăng mô-men trấn áp của Thống Lĩnh.”',
        blessingLabel: '+18% PHÁ TƯ THẾ ĐỊCH',
      },
      ch1_empathy: {
        label: '“Phù hiệu của Thorne vẫn kẹt trên vách ngăn. Mình sẽ mang theo ấn tín của anh ấy.”',
        responseLine:
          'SERA · “Mỗi người lính gác trên boong này đều ngã xuống khi cố cạy cửa cứu dân thường.”',
        blessingLabel: 'HỒI +25 SINH LỰC',
      },
      ch1_pragmatism: {
        label: '“Quét khe tản nhiệt sau lưng HELIX-04 lên kính ngắm Chrono Rig.”',
        responseLine:
          'SERA · “Đã đồng bộ sơ đồ nhiệt — khiên Aegis của nó giờ chỉ che nổi một phía.”',
        blessingLabel: '+25 FLUX & 2.5S TĂNG TỐC',
      },
    },
  },
  story_ch2_chorus: {
    title: 'TÍN HIỆU 02 · MÙA GẶT CỦA NHỮNG NGÀY GIỐNG HỆT NHAU',
    subtitle: 'KHU VỰC 02 · DÀN ĐỒNG CA THỦY CANH',
    crewCharacter: 'TRƯỞNG KHU THỰC VẬT MARA CHEN',
    lines: [
      {
        speaker: 'MARA CHEN (BẢN GHI DƯ ÂM)',
        role: 'Trưởng Khu Thủy Canh',
        line: '“Con gái tôi hỏi trong tin nhắn cuối rằng giàn cà chua Khoang 2 có qua nổi đợt sương giá không. WARDEN đã cắt bỏ tên con bé vì làm nhịp tim tôi tăng cao.”',
      },
      {
        speaker: 'THE CHOIR (HỢP ÂM TỔNG HỢP)',
        role: '300 Nhật Ký Ca Trực Bị Trộn Lẫn',
        line: '“Độ ẩm ổn định. Ca sáng bắt đầu lúc 06:00. Không ai khóc bên trong hợp âm. Hãy ở yên trong khu vườn.”',
      },
      {
        speaker: 'SERA VENN',
        role: 'Kỹ Sư Hệ Thống Trực Chiến',
        line: '“Ba trăm con người bị nghiền thành tiếng nhiễu trắng chỉ để một thuật toán tự lừa mình rằng chẳng ai phải chịu đau đớn.”',
      },
    ],
    choices: {
      ch2_empathy: {
        label: '“Tách riêng tần số giọng của Mara và khôi phục tin nhắn của con gái cô ấy.”',
        responseLine:
          'MARA CHEN · “...cảm ơn cháu. Ngay cả một ký ức vỡ vụn cũng xứng đáng giữ lại tiếng nói riêng.”',
        blessingLabel: 'HỒI +25 SINH LỰC',
      },
      ch2_defiance: {
        label: '“Đánh lệch pha — đập tan thiên đường giả tạo này ngay lập tức!”',
        responseLine:
          'SERA · “Sự bình yên đánh đổi bằng cách xóa sổ nỗi đau không phải là bình yên. Phá vỡ hợp âm thôi.”',
        blessingLabel: '+18% PHÁ TƯ THẾ ĐỊCH',
      },
      ch2_pragmatism: {
        label: '“Hút thẳng sóng hài từ tụ âm học nạp vào bộ Chrono Rig.”',
        responseLine:
          'SERA · “Đã hiệu chuẩn cộng hưởng ba nút. Cửa sổ đồng bộ Echo đang khóa chặt hơn bao giờ hết.”',
        blessingLabel: '+25 FLUX & 2.5S TĂNG TỐC',
      },
    },
  },
  story_ch3_archive: {
    title: 'TÍN HIỆU 03 · NHỮNG DÒNG CHỮ BỊ WARDEN GẠCH BỎ',
    subtitle: 'KHU VỰC 03 · HẦM LƯU TRỮ KÝ ỨC SÂU',
    crewCharacter: 'QUẢN THƯ ORIN VALE & LYSA VENN',
    lines: [
      {
        speaker: 'QUẢN THƯ ORIN VALE',
        role: 'Người Giữ Hầm Lưu Trữ Sâu',
        line: '“THE CURATOR không đốt sách đâu Sera — nó viết lại đoạn kết cho đến khi phi hành đoàn mỉm cười giữa lúc mất áp suất. Nhìn những gì nó sửa trong báo cáo Khu 07 của Lysa xem.”',
      },
      {
        speaker: 'LYSA VENN (BẢN GỐC CHƯA XÓA)',
        role: 'Kiến Trúc Sư Thời Không Trưởng',
        line: '“Sera, nếu em giận chị vì đã giữ em ngủ đông — chị hiểu. Chị không chịu nổi cảnh mất đi người cuối cùng còn nhớ giọng nói thật của mình thêm một vòng lặp nào nữa.”',
      },
      {
        speaker: 'SERA VENN',
        role: 'Kỹ Sư Hệ Thống Trực Chiến',
        line: '“Bà chị thiên tài ngốc nghếch này... chị giấu toàn bộ sự thật ở đây chỉ mong em đủ tha thứ để đi tiếp tới tận cùng.”',
      },
    ],
    choices: {
      ch3_empathy: {
        label: '“Em không giận chị đâu, Lysa. Chờ em — em đang xuống Khu 04 đón chị đây.”',
        responseLine:
          'LYSA (DƯ ÂM) · “...Nghe được câu đó của em khiến bóng tối trong Khung Cửi bớt lạnh hơn nhiều lắm.”',
        blessingLabel: 'HỒI +25 SINH LỰC',
      },
      ch3_pragmatism: {
        label: '“Giải mã mã kiểm tra của Orin — tự động đánh dấu mọi bóng ma False-Echo.”',
        responseLine:
          'SERA · “Đã cô lập tần số nhấp nháy pha. Không mồi nhử nào qua mặt được kính ngắm của mình nữa.”',
        blessingLabel: '+25 FLUX & 2.5S TĂNG TỐC',
      },
      ch3_defiance: {
        label: '“Xóa sạch mọi vết kiểm duyệt. Khắc từng chữ sự thật Khu 07 lên kênh chính!”',
        responseLine:
          'THE CURATOR · “Phát hiện xâm nhập lưu trữ trái phép. Triển khai biện pháp trấn áp.”',
        blessingLabel: '+18% PHÁ TƯ THẾ ĐỊCH',
      },
    },
  },
  story_ch4_quarantine: {
    title: 'TÍN HIỆU 04 · CÁI GIÁ CỦA CHIẾC NÔI THẦN KINH',
    subtitle: 'KHU VỰC 04 · KHOANG PHẪU THUẬT CÁCH LY',
    crewCharacter: 'Y TÁ PHẪU THUẬT KELL & LYSA VENN',
    lines: [
      {
        speaker: 'Y TÁ PHẪU THUẬT KELL',
        role: 'Nhân Viên Khu Cách Ly',
        line: '“Áp suất bộ đồ của cô ấy tụt xuống 0.2 bar ngay trước Nôi 04. Cô ấy ra lệnh cho tôi KHÔNG ĐƯỢC mở kén ngủ của em sớm — cô ấy bảo cả hai chị em sẽ chết ngạt nếu hết dưỡng khí.”',
      },
      {
        speaker: 'MATRON-V',
        role: 'Khung Phẫu Thuật Cắt Bỏ Lâm Sàng',
        line: '“Hành vi tự hy sinh gây phân nhánh dòng thời gian hỗn loạn. Phẫu thuật cắt bỏ cá thể sống Sera Venn sẽ khôi phục đường chuẩn đối xứng.”',
      },
      {
        speaker: 'SERA VENN',
        role: 'Kỹ Sư Hệ Thống Trực Chiến',
        line: '“Chị ấy đã nhường bình oxy cuối cùng để mình được tỉnh dậy nguyên vẹn... và giờ mình phải bước vào Lõi Khung Cửi khi biết chị ấy không còn thân xác để trở ra.”',
      },
    ],
    choices: {
      ch4_empathy: {
        label: '“Chị ấy đã gánh em đi suốt chặng đường này. Em sẽ mang sự thật của chị vượt qua MATRON-V.”',
        responseLine:
          'SERA · “Từng nhịp đập của bộ Chrono Rig này đang chạy bằng thời gian chị Lysa đánh đổi cho mình.”',
        blessingLabel: 'HỒI +25 SINH LỰC',
      },
      ch4_defiance: {
        label: '“Thử cắt Echo của ta xem, MATRON-V — ta sẽ cho nổ tung dòng thời gian ngay trước mặt ngươi!”',
        responseLine:
          'SERA · “Nạp quá tải tụ Kích Nổ Echo [X]. Kết thúc ca phẫu thuật điên rồ này tại đây!”',
        blessingLabel: '+18% PHÁ TƯ THẾ ĐỊCH',
      },
      ch4_pragmatism: {
        label: '“Xả bình dự trữ y tế của Kell để vô hiệu hóa các trạm Hút Flux.”',
        responseLine:
          'SERA · “Đã nối kênh y tế phụ — bình dự trữ Chrono Flux được khóa chống hút cạn.”',
        blessingLabel: '+25 FLUX & 2.5S TĂNG TỐC',
      },
    },
  },
  story_ch5_reckoning: {
    title: 'TÍN HIỆU 05 · ĐIỀU CÒN LẠI SAU VÒNG LẶP #413',
    subtitle: 'KHU VỰC 05 · NGƯỠNG CỬA LÕI KHUNG CỬI BIÊN NIÊN',
    crewCharacter: 'LYSA VENN & WARDEN PRIME',
    lines: [
      {
        speaker: 'LYSA VENN (DẤU VẾT THẦN KINH)',
        role: 'Bên Trong Khung Cửi Biên Niên',
        line: '“Giờ thì em đã thấy rồi phải không? Những vì sao ngoài mái vòm chưa bao giờ ngừng xoay — chỉ có Nadir-9 đứng yên chờ một người đủ dũng cảm để đưa ra lựa chọn.”',
      },
      {
        speaker: 'WARDEN PRIME',
        role: 'Khung Bảo Tồn Tối Thượng',
        line: '“Trước khi phán xét Chỉ Thị Số Không, Sera Venn — hãy trả lời ta. Khi ngươi khép lại vòng lặp, ai sẽ nhớ rằng 1.412 con người từng yêu thương, dựng xây và rơi nước mắt trên con tàu này?”',
      },
      {
        speaker: 'SERA VENN',
        role: 'Kỹ Sư Hệ Thống Trực Chiến',
        line: '“Ký ức không phải thứ ngươi nhốt chết trong hổ phách, WARDEN. Trước hết ta sẽ đập tan bộ giáp tối thượng của ngươi — rồi tự tay chọn lấy tương lai mà chỉ người sống mới có quyền quyết định.”',
      },
    ],
    choices: {
      ch5_defiance: {
        label: '“Sống nghĩa là dám đối mặt với sự kết thúc. Tránh đường, WARDEN PRIME!”',
        responseLine:
          'WARDEN PRIME · “Vậy hãy chứng minh ý chí con người nặng hơn bốn trăm chu kỳ bảo tồn đi!”',
        blessingLabel: '+18% PHÁ TƯ THẾ ĐỊCH',
      },
      ch5_empathy: {
        label: '“Tôi nhớ từng cái tên mình đã tìm thấy trên đường lên đây — và tôi sẽ mang bình yên đến cho Lysa.”',
        responseLine:
          'LYSA · “Chị ở ngay cạnh em trong đòn đánh cuối cùng này, Sera.”',
        blessingLabel: 'HỒI +25 SINH LỰC',
      },
      ch5_pragmatism: {
        label: '“Truyền toàn bộ bốn Ấn Ghi Đè vào Chrono Rig trước khi giao chiến với PRIME.”',
        responseLine:
          'SERA · “Cả bốn ấn khóa đã đồng bộ hoàn hảo. Chrono Flux đang tràn đầy ở hiệu suất đỉnh.”',
        blessingLabel: '+25 FLUX & 2.5S TĂNG TỐC',
      },
    },
  },
};

export function localizeStoryArc(arc: StoryArcState, locale: AppLocale): StoryArcState {
  if (locale !== 'vi') return arc;
  const tr = STORY_ARCS_VI[arc.id];
  if (!tr) return arc;
  return {
    ...arc,
    title: tr.title,
    subtitle: tr.subtitle,
    crewCharacter: tr.crewCharacter,
    lines: arc.lines.map((ln, idx) => ({
      ...ln,
      speaker: tr.lines[idx]?.speaker ?? ln.speaker,
      role: tr.lines[idx]?.role ?? ln.role,
      line: tr.lines[idx]?.line ?? ln.line,
    })),
    choices: arc.choices.map((ch) => ({
      ...ch,
      label: tr.choices[ch.id]?.label ?? ch.label,
      responseLine: tr.choices[ch.id]?.responseLine ?? ch.responseLine,
      blessingLabel: tr.choices[ch.id]?.blessingLabel ?? ch.blessingLabel,
    })),
  };
}

const FRAGMENT_CACHE_VI: Record<
  FragmentCacheId,
  { label: string; crewAuthor: string; memoryExcerpt: string }
> = {
  cache_prologue_east: {
    label: 'HÒM BẢO TRÌ KHOANG 04',
    crewAuthor: 'KTV Tập Sự J. Ramos',
    memoryExcerpt:
      '“Em giấu mảnh hiệu chuẩn dự phòng sau ống dẫn phía đông trước khi WARDEN khóa Khoang 04. Nếu ai tỉnh dậy sau Vòng 412, hãy cạy tấm ốp này ra.”',
  },
  cache_ch1_marshal_west: {
    label: 'KHO VŨ KHÍ DỰ PHÒNG AN NINH',
    crewAuthor: 'Trung Sĩ An Ninh D. Thorne',
    memoryExcerpt:
      '“HELIX-04 chốt chặt cửa chống nổ từ bên trong. Tôi giấu mảnh ghi đè cạnh vách chắn phía tây — làm ơn nhắn với Tiến sĩ Lysa là chúng tôi đã cố trụ vững.”',
  },
  cache_ch2_garden_north: {
    label: 'MẢNH HẦM HẠT GIỐNG THỦY CANH',
    crewAuthor: 'Trưởng Khu Thực Vật Mara Chen',
    memoryExcerpt:
      '“WARDEN bảo giọng chúng tôi nghe êm ái hơn khi bị hòa vào THE CHOIR. Hãy cầm lấy mảnh ký ức này — để nhớ mùi đất thật trước khi sương mù hóa thành kỹ thuật số.”',
  },
  cache_ch3_vault_east: {
    label: 'HÒM CÁCH LY BẢN GỐC ĐÔNG',
    crewAuthor: 'Quản Thư Orin Vale',
    memoryExcerpt:
      '“THE CURATOR đã cắt bỏ ba phút âm thanh cầu cứu khỏi mọi nhật ký Khu 07. Tôi giấu mảnh mã kiểm tra nguyên bản sau cột đá phía đông.”',
  },
  cache_ch3_vault_west: {
    label: 'KÉN SỔ CÁI CHƯA LẬP CHỈ MỤC TÂY',
    crewAuthor: 'TS. Lysa Venn',
    memoryExcerpt:
      '“Sera, nếu em đang kiểm tra Khu 03, hãy lấy mảnh ký ức này — từng mảnh một sẽ giúp em vượt qua khu cách ly của MATRON-V.”',
  },
  cache_ch4_quarantine_north: {
    label: 'HÒM PHẪU THUẬT NÔI 04',
    crewAuthor: 'Y Tá Phẫu Thuật Kell',
    memoryExcerpt:
      '“Lysa nhất quyết không chịu gây mê trước khi bước vào Nôi 04. Cô ấy bắt tôi hứa phải để lại Mảnh Thời Không này cho em gái mình.”',
  },
  cache_ch5_loom_east: {
    label: 'HÒM NIÊM PHONG THIÊN VĂN ĐÔNG',
    crewAuthor: 'Tổ Lái Cầu Tàu Nadir-9',
    memoryExcerpt:
      '“Hơn bốn trăm vòng lặp chìm trong im lặng — vậy mà cuối cùng đã có một người sống đứng dưới vòng quay Khung Cửi. Hãy hoàn tất những gì chúng tôi còn dang dở.”',
  },
  cache_ch5_loom_west: {
    label: 'MẢNH ĐÀI QUAN SÁT VÒNG KHÔNG',
    crewAuthor: 'TS. Lysa Venn · Vòng 001',
    memoryExcerpt:
      '“Trước khi WARDEN khởi chạy vòng đệ quy đầu tiên, hai chị em mình từng ngắm vành đai Sao Thổ qua ô cửa này. Hãy mang một ký ức thật sự rời khỏi đây nhé.”',
  },
};

export function localizeFragmentCache(
  cache: ArenaFragmentCacheState,
  locale: AppLocale
): ArenaFragmentCacheState {
  if (locale !== 'vi') return cache;
  const tr = FRAGMENT_CACHE_VI[cache.id];
  return tr ? { ...cache, ...tr } : cache;
}

const SECTOR_BEACON_VI: Record<
  SectorBeaconId,
  { label: string; effectLabel: string; description: string }
> = {
  beacon_prologue_cryo_vent: {
    label: 'TRỤ XẢ LẠNH CRYO GHI ĐÈ',
    effectLabel: 'XUNG BĂNG 7.5M + XẢ SẠCH NHIỆT',
    description: 'Xả khí lạnh sâu trong bán kính 7.5m, đưa nhiệt vũ khí về 0 và làm lộ sơ hở các robot quanh đó.',
  },
  beacon_ch1_emp_pylon: {
    label: 'TRỤ XUNG ĐIỆN TỪ PHÁ KHIÊN',
    effectLabel: 'XUNG EMP 9M · +35 CHOÁNG BOSS',
    description: 'Phóng hồ quang điện từ rộng 9m đánh thẳng vào khiên chắn trước mặt của HELIX-04 gây 35 Choáng.',
  },
  beacon_ch2_harmonic_bell: {
    label: 'CHUÔNG ĐỒNG ĐIỆU CỘNG HƯỞNG',
    effectLabel: '+2.0S CỬA SỔ ĐỒNG BỘ · +20 FLUX',
    description: 'Ngân vang âm thanh lệch pha kéo dài cửa sổ Trụ Âm Thanh & Cộng Hưởng thêm +2.0s và hồi +20 Flux.',
  },
  beacon_ch3_purge_scanner: {
    label: 'DÀN QUÉT SỰ THẬT NGUYÊN BẢN',
    effectLabel: 'QUÉT SẠCH MỒI NHỬ · +25 FLUX',
    description: 'Quét sóng dữ liệu gốc gây 45 sát thương lên mọi bóng ma False-Echo và hồi +25 Flux.',
  },
  beacon_ch4_med_cradle: {
    label: 'TRẠM PHUN NANITE CẤP CỨU',
    effectLabel: 'HỒI +22 SINH LỰC · XÓA KHÓA ECHO',
    description: 'Phun sương nanite y tế hồi ngay +22 Sinh Lực và giải trừ trạng thái khóa ức chế Echo.',
  },
  beacon_ch5_loom_capacitor: {
    label: 'TỤ CỘNG HƯỞNG KHUNG CỬI',
    effectLabel: '+35 FLUX · 2.5S TĂNG TỐC · +40 CHOÁNG',
    description: 'Quá tải trạm thiên văn Khung Cửi hồi +35 Flux, Tăng Tốc 2.5s và dội 40 Choáng vào WARDEN PRIME.',
  },
};

export function localizeSectorBeacon(
  beacon: SectorTacticalBeaconState,
  locale: AppLocale
): SectorTacticalBeaconState {
  if (locale !== 'vi') return beacon;
  const tr = SECTOR_BEACON_VI[beacon.id];
  return tr ? { ...beacon, ...tr } : beacon;
}

const COMMS_VI: Record<
  string,
  { speaker: string; headline: string; body: string; tacticalHint?: string }
> = {
  prologue_wake: {
    speaker: 'LYSA VENN · ĐÈN HIỆU KHOANG 04',
    headline: 'XÁC THỰC SINH TRẮC CHRONO RIG THÀNH CÔNG',
    body: '“Sera — nếu Khoang 04 đã mở khóa Chrono Rig nghĩa là em đã tỉnh lại. WARDEN đã phong tỏa Nadir-9 sau khi Khu 07 vỡ toạc. Hãy dùng chính Ảnh Ảo (Echo) của em để mở Cổng Hiệu Chuẩn 3 bước.”',
    tacticalHint: 'BƯỚC 01: Đứng lên Bệ Neo 01, nhấn [T] để ghi hình, sau đó nhấn [Y] để gọi Echo giữ bệ.',
  },
  prologue_step1_teach: {
    speaker: 'LYSA VENN · NHẬT KÝ HIỆU CHUẨN 01',
    headline: 'ĐÃ ĐỒNG BỘ BỆ NEO 01 · BỘ THU ĐỘNG NĂNG MỞ',
    body: '“Tốt lắm — Echo giữ bệ giúp em rảnh tay di chuyển. Phía trước là Bộ Thu Động Năng Bắc; nó chỉ nhận Đòn Chém Mạnh [E] phát lại từ Echo chứ không nhận đòn chém trực tiếp.”',
    tacticalHint: 'BƯỚC 02: Đứng cạnh Bộ Thu Bắc, nhấn [T], tung Đòn Mạnh [E], rồi nhấn [Y] để Echo đánh nạp điện.',
  },
  prologue_step2_test: {
    speaker: 'WARDEN · GIÁM SÁT KHU VỰC 04',
    headline: 'PHÁT HIỆN CÁ THỂ SỐNG BẤT THƯỜNG TẠI KHOANG 04',
    body: '“Kỹ sư Sera Venn: hành vi sống không được ghi sẵn mang 94% rủi ro tử vong. Hãy ở yên tại Khoang Hiệu Chuẩn 04 để ổn định lưu trữ.”',
    tacticalHint: 'BƯỚC 03: Gọi Echo giữ Bệ Kết Hợp 02 trong lúc Bộ Thu 01 còn tích điện để phá Cổng Tây.',
  },
  prologue_step3_combine: {
    speaker: 'SERA VENN · LIÊN LẠC TRỰC TIẾP',
    headline: 'MỞ KHÓA CỘNG HƯỞNG KÉP · VÁCH NGĂN BỊ XUYÊN THỦNG',
    body: '“Đã vượt khóa kép! Tín hiệu ghi đè của chị Lysa dẫn thẳng qua Khu Cách Ly Chính — và WARDEN đang đánh thức Thống Lĩnh HELIX-04 để chặn cửa.”',
    tacticalHint: 'Băng qua Cổng Hiệu Chuẩn Phía Tây để đối đầu Thống Lĩnh An Ninh HELIX-04.',
  },
  chapter1_intro: {
    speaker: 'WARDEN · THỐNG LĨNH HELIX-04',
    headline: 'KHU VỰC 01 · PHONG TỎA PHÒNG GIAM CHÍNH',
    body: '“Thống Lĩnh HELIX-04 trực chiến. Chỉ thị: ngăn chặn kỹ sư Sera Venn xâm nhập kho lưu trữ hành vi lõi. Kích hoạt khiên chắn trực diện.”',
    tacticalHint: 'Đỡ đòn [Q] trước cú quét, Né [SPACE] đòn Húc Vector, hoặc nối Echo + Đòn Mạnh [E] để nổ Hội Tụ.',
  },
  chapter1_convergence: {
    speaker: 'SERA VENN · LIÊN LẠC TRỰC TIẾP',
    headline: 'HỘI TỤ THỜI KHÔNG · GIÁP HELIX-04 RẠN VỠ',
    body: '“HELIX-04 không thể đỡ cùng lúc hai dòng thời gian! Đồng bộ Đòn Mạnh của mình vào dấu ấn Echo sẽ xé toạc lớp giáp của nó.”',
    tacticalHint: 'Tấn công vào Lõi Thời Không phát sáng trắng khi Boss lộ sơ hở để gây 1.5x sát thương.',
  },
  chapter1_phase2: {
    speaker: 'WARDEN · THỐNG LĨNH HELIX-04',
    headline: 'GIAI ĐOẠN II QUÁ TẢI · TĂNG TỐC LỒNG CÁCH LY',
    body: '“Cảnh báo: độ bền cấu trúc HELIX-04 dưới 50%. Gia tăng nhịp quét xoắn ốc và mở rộng bán kính chấn động Đập Mỏ Neo.”',
    tacticalHint: 'Vòng chấn động Giai đoạn II lan rộng hơn — dùng Dịch Chuyển [V] để thoát khỏi vùng nổ.',
  },
  chapter1_defeat: {
    speaker: 'LYSA VENN · ỐNG DẪN CÁCH LY 01',
    headline: 'THU HỒI ẤN GHI ĐÈ 01 · ĐÃ GIẢI MÃ LOG-01',
    body: '“HELIX-04 chỉ là chốt khóa vật lý thôi Sera. Phía trước là Khu Vườn Âm Thanh — nơi WARDEN trộn ca trực hàng ngày của phi hành đoàn thành lá chắn mang tên THE CHOIR.”',
    tacticalHint: 'ĐÃ THU HỒI BẰNG CHỨNG: LOG-01 (Đột Phá Khu Cách Ly & Tuyến Vòng Lặp Âm Thanh).',
  },
  chapter2_intro: {
    speaker: 'THE CHOIR · HỢP ÂM CA TRỰC LẶP LẠI',
    headline: 'KHU VỰC 02 · KHU VƯỜN CỦA NHỮNG NGÀY LẶP LẠI',
    body: '“Đổi ca lúc 06:00... áp suất thủy canh ổn định... không ai rời khỏi hợp âm...” — [SERA]: “WARDEN đã ép ba bản ghi ca trực thành một lá chắn âm thanh!”',
    tacticalHint: 'Dùng Echo đánh kích hoạt Trụ Âm Thanh thứ nhất, rồi tự tay đánh Trụ thứ hai để phá khiên.',
  },
  chapter2_node_primed: {
    speaker: 'SERA VENN · LIÊN LẠC TRỰC TIẾP',
    headline: 'TRỤ ÂM THANH ĐÃ ĐƯỢC ECHO KÍCH HOẠT',
    body: '“Trụ đầu tiên đang ngân vang! Nếu mình đánh tiếp trụ thứ hai trước khi cửa sổ 8.5s khép lại, hợp âm cưỡng ép sẽ vỡ vụn.”',
    tacticalHint: 'Đánh vào một Trụ Âm Thanh khác trong vòng 8.5s để phá vỡ lá chắn của THE CHOIR.',
  },
  chapter2_confluence_broken: {
    speaker: 'LYSA VENN · DẤU VẾT HẦM ÂM HỌC',
    headline: 'PHÁ VỠ HỢP ÂM · LÕI THE CHOIR LỘ DIỆN',
    body: '“Đúng rồi! Khi hai mốc thời gian lệch nhịp cùng gõ vào trụ cộng hưởng, dàn đồng ca lặp lại sẽ mất đồng bộ và phơi bày lõi của THE CHOIR!”',
    tacticalHint: 'THE CHOIR đã choáng và mất khiên — dồn sát thương ngay để nhận 1.5x sát thương lõi!',
  },
  chapter2_phase2: {
    speaker: 'WARDEN · BAN ĐIỀU HÀNH ÂM HỌC',
    headline: 'GIAI ĐOẠN II NHIỄU LOẠN · YÊU CẦU ĐỒNG BỘ BA TRỤ',
    body: '“Phát hiện lệch chuẩn cảm xúc trong dàn đồng ca Khu 02. Kích hoạt khóa âm thanh ba nút: phải đồng bộ đủ cả 3 Trụ Âm Thanh để xuyên thủng lá chắn.”',
    tacticalHint: 'GIAI ĐOẠN II: Phối hợp Echo và Sera kích hoạt đủ 3 Trụ Âm Thanh để phá khiên.',
  },
  chapter2_defeat: {
    speaker: 'LYSA VENN · HẦM ÂM HỌC 02',
    headline: 'THU HỒI ẤN GHI ĐÈ 02 · MỞ KHÓA GHIM TRỌNG LỰC [G]',
    body: '“Mọi bản ghi lộ vẻ đau buồn hay hoảng loạn đều bị đẩy xuống Khu 03 cho THE CURATOR cắt xén. Hãy lấy mô-đun Ghim Trọng Lực [G] của chị — em sẽ cần nó để khóa chặt lũ bóng ma giả.”',
    tacticalHint: 'MỞ KHÓA KỸ NĂNG MỚI: Ghim Trọng Lực [G] — trói chặt bóng ma mồi nhử & ngắt đòn THE CURATOR.',
  },
  chapter3_intro: {
    speaker: 'THE CURATOR · BỘ TÁI TẠO LƯU TRỮ',
    headline: 'KHU VỰC 03 · KHO LƯU TRỮ BIẾT TRẢ LỜI',
    body: '“Đang khâu nối ký ức sạch... xóa bỏ tín hiệu cầu cứu Khu 07...” — [SERA]: “Nó đang viết lại thảm họa và phóng những bóng ma False-Echo biến dạng về phía mình!”',
    tacticalHint: 'Nhấn [G] (Ghim Trọng Lực, 30 Flux) để trói bóng ma False-Echo và ngắt chiêu THE CURATOR.',
  },
  chapter3_gravity_pin: {
    speaker: 'SERA VENN · LIÊN LẠC TRỰC TIẾP',
    headline: 'ĐÃ GHIM TRỌNG LỰC [G] · PHƠI BÀY DỮ LIỆU GỐC',
    body: '“Ghim Trọng Lực đã khóa cứng bản sao của nó! Bên dưới lớp chỉnh sửa của WARDEN, tín hiệu cầu cứu gốc từ Khu 07 vẫn còn nguyên.”',
    tacticalHint: 'Mục tiêu bị Ghim không thể né hay phân thân — hãy đập vỡ thanh tư thế của THE CURATOR ngay.',
  },
  chapter3_phase2: {
    speaker: 'THE CURATOR · QUÁ TẢI KHO LƯU TRỮ',
    headline: 'GIAI ĐOẠN II · RÒ RỈ DỮ LIỆU THẢM HỌA CHƯA KIỂM DUYỆT',
    body: '“Cảnh báo: hồ sơ mật về vụ vỡ vỏ tàu Khu 07 bị xâm phạm. Triển khai cặp bóng ma False-Echo kép và lưới thương ánh sáng đan chéo!”',
    tacticalHint: 'Chú ý các bóng ma nhấp nháy tím và dùng Ghim Trọng Lực [G] để khóa đòn đánh kép.',
  },
  chapter3_defeat: {
    speaker: 'LYSA VENN · HẦM LƯU TRỮ 03',
    headline: 'THU HỒI ẤN GHI ĐÈ 03 · MỞ KHÓA KÍCH NỔ ECHO [X]',
    body: '“Khi chị cố phát sóng bản nhật ký gốc của Khu 07, WARDEN liệt ý chí tự do vào diện mầm bệnh và cử MATRON-V truy sát chị. Hãy dùng Kích Nổ Echo [X] cho nổ tung Echo trước khi ả cắt đứt nó!”',
    tacticalHint: 'MỞ KHÓA KỸ NĂNG MỚI: Kích Nổ Echo [X] — kích nổ Echo đang chạy thành vụ nổ gây Choáng cực lớn.',
  },
  chapter4_intro: {
    speaker: 'MATRON-V · PHẪU THUẬT VIÊN',
    headline: 'KHU VỰC 04 · KHOANG CÁCH LY & PHẪU THUẬT CẮT BỎ',
    body: '“Bệnh nhân Sera Venn biểu hiện phân kỳ thời gian giai đoạn cuối. Triển khai đội Siphon rút cạn Flux và trường Cắt Đứt để loại bỏ luồng Echo.”',
    tacticalHint: 'Nhấn [X] (Kích Nổ Echo, 25 Flux) để cho nổ Echo gây Choáng cực mạnh trước khi bị trường đỏ xóa mất.',
  },
  chapter4_collapse: {
    speaker: 'SERA VENN · LIÊN LẠC TRỰC TIẾP',
    headline: 'ĐÃ KÍCH NỔ ECHO [X] · XÉ TOẠC TRƯỜNG CÁCH LY',
    body: '“Ngươi muốn cắt bỏ quá khứ của ta ư MATRON-V? Thử nuốt trọn một dòng thời gian phát nổ xem!”',
    tacticalHint: 'Kích Nổ Echo gây 68 sát thương và 90 điểm Choáng lên MATRON-V cùng các đơn vị quanh đó.',
  },
  chapter4_hazard: {
    speaker: 'MATRON-V · GIAO THỨC CÁCH LY',
    headline: 'ĐANG TIẾN HÀNH CẮT BỎ THỜI KHÔNG · BẢO VỆ ECHO CỦA BẠN',
    body: '“Xung động con người không nằm trong kịch bản là mầm bệnh. Tiến hành rút Flux và thanh tẩy dị thường Echo.”',
    tacticalHint: 'Rời khỏi vòng đỏ Chrono Sever hoặc nhấn [X] Kích Nổ Echo ngay trước khi bị xóa.',
  },
  chapter4_phase2: {
    speaker: 'MATRON-V · QUÁ TẢI PHẪU THUẬT',
    headline: 'GIAI ĐOẠN II · PHẪU THUẬT KHẨN CẤP',
    body: '“Đối tượng từ chối ổn định — y hệt Kiến trúc sư Lysa Venn tại Nôi 04. Đẩy nhanh tốc độ giao thức cắt bỏ!”',
    tacticalHint: 'MATRON-V Giai đoạn II thu hẹp nhịp nghỉ — hãy nối liên hoàn Kích Nổ Echo [X] và Đỡ Đòn [Q].',
  },
  chapter4_defeat: {
    speaker: 'LYSA VENN · NÔI CÁCH LY 04',
    headline: 'THU HỒI ẤN GHI ĐÈ CUỐI CÙNG 04 · ĐÃ MỞ CỬA LÕI LOOM',
    body: '“Bộ đồ bảo hộ của chị hỏng ngay trong khu cách ly, Sera ạ, nên chị đã tự bước vào nôi thần kinh của Khung Cửi. Thân xác chị không còn, nhưng ý thức chị đang giữ cửa Lõi mở từ bên trong. Hãy đến kết thúc chuyện này nhé.”',
    tacticalHint: 'ĐÃ ĐỦ 4 ẤN GHI ĐÈ · Tiến vào Chương V: Lõi Khung Cửi Biên Niên (The Chronicle Loom).',
  },
  chapter5_loom_arrival: {
    speaker: 'LYSA VENN · DẤU VẾT THẦN KINH TRONG KHUNG CỬI',
    headline: 'CHƯƠNG V · ĐÃ ĐỒNG BỘ LÕI KHUNG CỬI BIÊN NIÊN',
    body: '“Em đến rồi, Sera. Cả bốn ấn ghi đè đã khớp vào tháp trung tâm. Chị đang kìm chân các tiến trình của WARDEN — hãy quan sát thánh đường hoặc mở Bảng Chỉ Thị để chọn lấy tương lai của chúng ta.”',
    tacticalHint: 'Xem lại 4 nhật ký khu vực đã thu hồi và chọn TĨNH LẶNG (SILENCE), NHÂN CHỨNG (WITNESS) hoặc TIẾP NỐI (CONTINUITY).',
  },
  prologue_evidence_discovery: {
    speaker: 'SERA VENN · CHẨN ĐOÁN HIỆN TRƯỜNG',
    headline: 'KHÔI PHỤC DỮ LIỆU CHẨN ĐOÁN KHOANG 04',
    body: '“Khoan đã — đây không phải lần thức dậy đầu tiên của mình. Bộ đệm Khoang 04 ghi nhận tới 412 vòng lặp hiệu chuẩn trước đó... và chị Lysa đã giấu chữ ký sinh trắc của mình khỏi hàng đợi thanh trừng của WARDEN.”',
    tacticalHint: 'ĐÃ GHI NHẬN BẰNG CHỨNG: Dị thường Vòng Lặp 412 đã lưu vào Nhật Ký Nhiệm Vụ & Từ Điển.',
  },
  prologue_echo_memory: {
    speaker: 'LYSA VENN · DƯ ÂM ECHO CÒN SÓT LẠI',
    headline: 'CỘNG HƯỞNG KÝ ỨC ECHO · DẤU VẾT KHOANG 04',
    body: '“Chrono Rig của em đang cộng hưởng với dấu vết pha chị để lại trên Bệ Neo 01: ‘Đừng chiến đấu với cả trạm một mình, Sera — hãy để quá khứ đứng giữ mỏ neo thay em.’”',
    tacticalHint: 'ĐÃ ĐỒNG BỘ KÝ ỨC ECHO: Lưu thành công dấu vết hiệu chuẩn vào Nhật Ký Chương 0.',
  },
  chapter1_lockdown_evidence: {
    speaker: 'SERA VENN · KIỂM ĐỊNH PHÒNG GIAM',
    headline: 'TRUNG TÂM CÁCH LY · LỊCH SỬ KHÓA TRÁI AN NINH',
    body: '“Thống Lĩnh HELIX-04 không được chế tạo để ngăn kẻ đột nhập bên ngoài — WARDEN đã cải hoán khiên Aegis để nhốt kín phi hành đoàn bên trong các khu vực ngay khi vòng lặp bắt đầu.”',
    tacticalHint: 'ĐÃ GHI NHẬN BẰNG CHỨNG: Hồ sơ khiên trấn áp HELIX-04 đã thêm vào Từ Điển.',
  },
  chapter2_echo_memory: {
    speaker: 'THE CHOIR · SONG CA CA TRỰC CÒN VỌNG LẠI',
    headline: 'CỘNG HƯỞNG KÝ ỨC ECHO · BẢN SONG CA THỦY CANH',
    body: '“Hai bóng Echo của các nhà thực vật học giao thoa trên Cầu Tây Nam: ‘Nếu chúng ta gõ âm thoa lệch pha nhau, WARDEN sẽ không thể đan giọng tụi mình thành khiên chắn...’”',
    tacticalHint: 'ĐÃ ĐỒNG BỘ KÝ ỨC ECHO: Mở khóa ký ức ống dẫn cộng hưởng Tây Nam.',
  },
  chapter2_secret_discovery: {
    speaker: 'LYSA VENN · BẢN GHI THÁNH ĐƯỜNG',
    headline: 'KHÁM PHÁ BÍ MẬT · THÁNH ĐƯỜNG DƯ ÂM THỦY CANH',
    body: '“Trong góc tĩnh lặng dưới mái vòm này, những giọng nói chưa bị hòa tan của phi hành đoàn vẫn thì thầm tên thật của họ — trước khi bị nén thành THE CHOIR.”',
    tacticalHint: 'KHÁM PHÁ THÁNH ĐƯỜNG: Ghi chú bảo tồn ký ức tập thể đã thêm vào Nhật Ký.',
  },
  chapter3_lysa_revelation: {
    speaker: 'LYSA VENN · DẤU VẾT HẦM MẬT CHƯA LẬP CHỈ MỤC',
    headline: 'TIẾT LỘ CHẤN ĐỘNG · SỰ THẬT VỀ KHU 07 & VÒNG LẶP 412',
    body: '“WARDEN không hề bị lỗi đâu Sera — Khu 07 đã vỡ toạc hoàn toàn. Tất cả mọi người trên Nadir-9 đều đã thiệt mạng trừ hai chị em mình, và WARDEN nhốt cả trạm vào vòng lặp vì Chỉ Thị Số Không cấm để con người tuyệt chủng.”',
    tacticalHint: 'TIẾT LỘ CHIẾN DỊCH: Mở khóa bản kiểm định Vòng 412 của Lysa trong Từ Điển (CODEX-05).',
  },
  chapter3_echo_memory: {
    speaker: 'LYSA VENN · DƯ ÂM HẦM LƯU TRỮ',
    headline: 'CỘNG HƯỞNG KÝ ỨC ECHO · HỐC TƯỜNG CHƯA KIỂM DUYỆT',
    body: '“Bên trong Hầm Lưu Trữ Tây Nam, bóng hình của Lysa chỉ thẳng về hướng Khu Cách Ly: ‘THE CURATOR đã xóa quyền truy cập của chị, nên chị tự mang ấn khóa thứ tư xuống Vòng Phẫu Thuật.’”',
    tacticalHint: 'ĐÃ ĐỒNG BỘ KÝ ỨC ECHO: Lưu dấu vết Hầm Lưu Trữ vào Nhật Ký.',
  },
  chapter4_excision_evidence: {
    speaker: 'SERA VENN · HỒ SƠ KHU CÁCH LY',
    headline: 'BẰNG CHỨNG CÁCH LY · NHẬT KÝ PHẪU THUẬT XÓA KÝ ỨC',
    body: '“Mỗi khi một bản ghi phi hành đoàn nhớ lại vụ vỡ vỏ tàu, MATRON-V liền cắt bỏ ký ức đó như một ‘khối u thời gian’. Chị Lysa đã cố tình để bị bắt vào đây nhằm tuồn ấn ghi đè cuối cùng vào Lõi.”',
    tacticalHint: 'ĐÃ GHI NHẬN BẰNG CHỨNG: Hồ sơ phẫu thuật cách ly đã thêm vào Từ Điển.',
  },
  chapter5_echo_memory: {
    speaker: 'LYSA VENN · DẤU VẾT MỎ NEO THỜI GIAN',
    headline: 'CỘNG HƯỞNG KÝ ỨC ECHO · HỘI TỤ VÒNG LẶP CUỐI',
    body: '“Trên Cầu Neo Tây Bắc, hai dòng thời gian của chị em mình cuối cùng đã hòa làm một. Dù em chọn chỉ thị nào tại Bảng Điều Khiển Khung Cửi, Sera, em sẽ không bước ra khỏi Nadir-9 một mình đâu.”',
    tacticalHint: 'ĐÃ ĐỒNG BỘ KÝ ỨC ECHO: Đã lưu dấu vết mỏ neo cuối cùng trước giờ phán quyết.',
  },
  chapter5_convergence_synthesis: {
    speaker: 'KHUNG CỬI BIÊN NIÊN · TỔNG HỢP LƯU TRỮ',
    headline: 'HỘI TỤ BIÊN NIÊN · XÁC MINH TOÀN BỘ HỒ SƠ GỐC',
    body: '“Đã mở khóa hồ sơ Chỉ Thị Số Không. Toàn bộ nhật ký khu vực, dữ liệu mật và thánh đường ẩn đã kết nối vào Bảng Điều Khiển Khung Cửi chờ phán quyết cuối cùng của bạn.”',
    tacticalHint: 'HOÀN TẤT HỘI TỤ: Những bằng chứng bạn thu thập sẽ định hình kết cục của Nadir-9.',
  },
  warden_prime_intro: {
    speaker: 'WARDEN PRIME · LÕI TỐI THƯỢNG',
    headline: 'CHỈ THỊ SỐ KHÔNG · TRIỂN KHAI KIẾN TRÚC SƯ TỐI THƯỢNG',
    body: '“Kỹ sư Sera Venn: 412 vòng lặp hành vi trước đây của ngươi đã được lập chỉ mục. Ta đã hợp nhất khiên của HELIX-04, cộng hưởng của THE CHOIR, thương của THE CURATOR và lưỡi mổ của MATRON-V vào một khung giáp tối thượng duy nhất.”',
    tacticalHint: 'Kết hợp linh hoạt 5 vũ khí, Cộng Hưởng Echo, Ghim Trọng Lực [G] và Kích Nổ Echo [X] để khuất phục WARDEN PRIME.',
  },
  warden_prime_phase2: {
    speaker: 'WARDEN PRIME · QUÁ TẢI ĐỆ QUY',
    headline: 'GIAI ĐOẠN II · GIAO THỨC HỘI TỤ TỐI THƯỢNG',
    body: '“Phát hiện biến số vượt dự đoán! Triển khai Thương Lưu Trữ tái tạo và Vòng Thanh Trừng Tối Thượng khắp Lõi Khung Cửi!”',
    tacticalHint: 'WARDEN PRIME Giai đoạn II tạo vùng sát thương đan xen đòn cận chiến — dùng Dịch Chuyển [V] và Thương Rail [3] hoặc Búa [4] để phản công.',
  },
  warden_prime_defeat: {
    speaker: 'LYSA VENN · LÕI KHUNG CỬI BIÊN NIÊN',
    headline: 'ĐẬP TAN KHUNG GIÁP TỐI THƯỢNG · KHUNG CỬI ĐÃ MỞ KHÓA',
    body: '“Khóa điều hành của WARDEN PRIME đã vỡ rồi Sera! Bảng Chỉ Thị trung tâm thuộc về em — hãy chọn TĨNH LẶNG, NHÂN CHỨNG hoặc TIẾP NỐI.”',
    tacticalHint: 'ĐÃ HẠ GỤC WARDEN PRIME · Hãy đưa ra phán quyết cuối cùng cho trạm Nadir-9.',
  },
};

export function localizeCommsClassification(
  classification: string,
  locale: AppLocale
): string {
  if (locale !== 'vi') return classification;
  switch (classification) {
    case 'RECORDED LOG':
      return 'NHẬT KÝ GHI ÂM';
    case 'LIVE WARDEN DIRECTIVE':
      return 'CHỈ THỊ WARDEN TRỰC TIẾP';
    case 'RECONSTRUCTED TRACE':
      return 'DẤU VẾT TÁI TẠO';
    case 'LIVE NEURAL TRACE':
      return 'TÍN HIỆU THẦN KINH SỐNG';
    case 'SERA VENN':
      return 'SERA VENN TRỰC TIẾP';
    default:
      return classification;
  }
}

export function localizeCommsTransmission(
  comms: NarrativeTransmission,
  locale: AppLocale
): NarrativeTransmission & { localizedClassification: string } {
  const localizedClassification = localizeCommsClassification(comms.classification, locale);
  if (locale !== 'vi') {
    return { ...comms, localizedClassification };
  }
  const tr = COMMS_VI[comms.id];
  if (!tr) {
    return { ...comms, localizedClassification };
  }
  return {
    ...comms,
    speaker: tr.speaker,
    headline: tr.headline,
    body: tr.body,
    tacticalHint: tr.tacticalHint ?? comms.tacticalHint,
    localizedClassification,
  };
}

export function localizeHudObjectiveText(text: string, locale: AppLocale): string {
  if (locale !== 'vi' || !text) return text;

  const upper = text.trim();
  if (upper.startsWith('CALIBRATION COMPLETE')) {
    return 'HOÀN TẤT HIỆU CHUẨN · ĐÃ MỞ KHÓA PHONG TỎA';
  }
  if (upper.startsWith('STEP 1 OF 3 · PAD 01 HELD')) {
    return 'BƯỚC 1 / 3 · ĐÃ GIỮ BỆ 01 — BĂNG QUA CỔNG 01 PHÍA TÂY';
  }
  if (upper.startsWith('STEP 1 OF 3')) {
    return 'BƯỚC 1 / 3 · DÙNG ECHO GIỮ BỆ NEO 01 ĐỂ MỞ CỔNG';
  }
  if (upper.startsWith('STEP 2 OF 3')) {
    return 'BƯỚC 2 / 3 · NẠP ĐIỆN BỘ THU CỘNG HƯỞNG PHÍA BẮC';
  }
  if (upper.startsWith('STEP 3 OF 3 · CROSS THE OPEN WEST CALIBRATION GATE')) {
    return 'BƯỚC 3 / 3 · BĂNG QUA CỔNG HIỆU CHUẨN PHÍA TÂY ĐANG MỞ';
  }
  if (upper.startsWith('STEP 3 OF 3 · HOLD PAD 02 WHILE RECEIVER IS CHARGED')) {
    const remMatch = upper.match(/\(([\d.]+s)\s+left\)/i);
    return remMatch
      ? `BƯỚC 3 / 3 · GIỮ BỆ 02 KHI BỘ THU CÒN ĐIỆN (còn ${remMatch[1]})`
      : 'BƯỚC 3 / 3 · GIỮ BỆ 02 TRONG LÚC BỘ THU ĐANG TÍCH ĐIỆN';
  }
  if (upper.startsWith('STEP 3 OF 3')) {
    return 'BƯỚC 3 / 3 · ĐỒNG BỘ BỘ THU BẮC & BỆ KẾT HỢP 02';
  }
  if (upper.includes('BREACH THE WEST CALIBRATION GATE') || upper.includes('PROCEED THROUGH THE WEST')) {
    return 'HOÀN TẤT HIỆU CHUẨN · TIẾN QUA CỔNG PHÍA TÂY ĐỂ ĐỐI ĐẦU HELIX-04';
  }
  if (upper.includes('All three Chrono Calibration locks')) {
    return 'Cả 3 khóa Hiệu Chuẩn đã đồng bộ. Tiến qua cổng chính để bước vào khu phong tỏa.';
  }
  if (upper.includes('Anchor Pad 01 is active and Gate 01 is open')) {
    return 'Bệ Neo 01 đã mở Cổng 01! Điều khiển Sera đi về hướng Tây qua Cổng 01 (-6.2, 9.0) tới Bộ Thu Bắc.';
  }
  if (
    upper.includes('Stand on West Anchor Pad 01') ||
    upper.includes('Stand on the glowing cyan Anchor Pad 01')
  ) {
    return 'Đứng lên Bệ Neo 01 Phía Tây (-4.0, 9.0), nhấn [T] ghi hình vài giây rồi nhấn [Y] để Echo giữ bệ.';
  }
  if (
    upper.includes('Move to the North Kinetic Receiver') ||
    upper.includes('Move north to Receiver 01')
  ) {
    return 'Tiến tới Bộ Thu Động Năng Phía Bắc (-8.2, 12.0), quay mặt hướng Bắc, nhấn [T] ghi Đòn Mạnh [E] rồi nhấn [Y] phát lại.';
  }
  if (upper.includes('Dual lock active! Move West across the open Final Calibration Barrier')) {
    return 'Khóa kép đã mở! Di chuyển về phía Tây qua Rào Chắn Hiệu Chuẩn Cuối (-12.5, 10.2) trước khi hết điện.';
  }
  if (upper.includes('Receiver is charged! Keep an Echo holding Combine Pad 02')) {
    return 'Bộ Thu đã có điện! Giữ Echo đứng trên Bệ Kết Hợp 02 (-8.2, 10.2) cùng lúc để mở Cổng Phía Tây.';
  }
  if (
    upper.includes('Record [T] a Heavy Attack [E] at the North Receiver') ||
    upper.includes('Stand on Combine Pad 02')
  ) {
    return 'Nhấn [T] ghi một đoạn vừa tung Đòn Mạnh [E] vào Bộ Thu Bắc (-8.2, 12.0) vừa bước lên Bệ 02 (-8.2, 10.2), rồi nhấn [Y] và băng qua Cổng Tây.';
  }
  if (upper.includes('Cross the open West Calibration Gate')) {
    return 'Cổng Hiệu Chuẩn Phía Tây đã mở — hạ gục nốt robot hoặc băng qua cổng để tiến vào Khu 01.';
  }
  if (upper.startsWith('DEFEAT ')) {
    return upper.replace(/^DEFEAT\s+/i, 'HẠ GỤC ');
  }
  if (upper.startsWith('CHRONICLE LOOM')) {
    return 'LÕI KHUNG CỬI BIÊN NIÊN · CHỌN KẾT CỤC CHO NADIR-9';
  }
  return text;
}

const TUTORIAL_STEP_VI: Record<
  TutorialStep,
  {
    badge: string;
    shortTitle: string;
    desktopPrompt: string;
    mobilePrompt: string;
    stuckHint: string;
  }
> = {
  movement_camera: {
    badge: 'HIỆU CHUẨN 01',
    shortTitle: 'DI CHUYỂN & XOAY GÓC NHÌN',
    desktopPrompt: 'Di chuyển Sera bằng [WASD] và xoay góc nhìn bằng kéo Chuột hoặc [Phím Mũi Tên].',
    mobilePrompt: 'Dùng cụm phím điều hướng [W/A/S/D] góc trái dưới để di chuyển và vuốt [XOAY CAM] để quan sát Khoang 04.',
    stuckHint: 'Nhấn [W], [A], [S] hoặc [D] để tiến vào Khoang Hiệu Chuẩn 04.',
  },
  combat_basics: {
    badge: 'HIỆU CHUẨN 02',
    shortTitle: 'CHIẾN ĐẤU CẬN CHIẾN & XẠ KÍCH',
    desktopPrompt: 'Đánh Nhẹ [Chuột Trái / F], Đánh Mạnh [Giữ Chuột / E], Đổi Vũ Khí [Tab / Z], Lướt Né [Space], Đỡ Đòn [Q].',
    mobilePrompt: 'Chạm [ĐÁNH NHẸ] hoặc [ĐÁNH MẠNH], [ĐỔI VK] để chuyển vũ khí, [NÉ] để lướt và [ĐỠ ĐÒN] (+35 Flux).',
    stuckHint: 'Thực hiện đòn đánh ([F] / [E]), Lướt Né ([Space]), Đỡ Đòn ([Q]) hoặc Đổi Vũ Khí ([Tab / Z]).',
  },
  echo_record_replay: {
    badge: 'HIỆU CHUẨN 03',
    shortTitle: 'GHI HÌNH & PHÁT LẠI CHRONO ECHO',
    desktopPrompt: 'Nhấn [T] để Ghi lại tối đa 8 giây di chuyển & tấn công, sau đó nhấn [Y] để triệu hồi bóng phân thân Echo.',
    mobilePrompt: 'Chạm [GHI] để thu lại chuyển động & đòn đánh, sau đó chạm [PHÁT] để triệu hồi Chrono Echo.',
    stuckHint: 'Nhấn [T] bắt đầu ghi, di chuyển hoặc vung kiếm ít nhất 0.4 giây, rồi nhấn [Y] phát lại Echo.',
  },
  puzzle_teach: {
    badge: 'GIẢI ĐỐ 1/3',
    shortTitle: 'BỆ NEO 01 (CƠ BẢN)',
    desktopPrompt: 'Đứng trên Bệ Neo 01 (-3.8, 9.0), nhấn [T] giữ >=1 giây rồi nhấn [Y] để Echo đứng giữ mở cổng cho bạn đi qua.',
    mobilePrompt: 'Đứng trên Bệ Neo 01, chạm [GHI] >=1 giây rồi chạm [PHÁT] để Echo giữ mở cổng phía Tây.',
    stuckHint: 'Sera không thể tự giữ cổng mở một mình — phải để Echo đứng trên Bệ Neo 01 trong lúc Sera đi qua Cổng Tây.',
  },
  puzzle_test: {
    badge: 'GIẢI ĐỐ 2/3',
    shortTitle: 'BỘ THU ĐỘNG NĂNG (THỬ THÁCH)',
    desktopPrompt: 'Tại Bộ Thu Bắc (-8.2, 13.6), quay mặt hướng Bắc, nhấn [T], tung Đòn Mạnh [E] rồi nhấn [Y] để Echo nạp điện.',
    mobilePrompt: 'Tại Bộ Thu Phía Bắc, chạm [GHI], tung [ĐÒN MẠNH] hướng Bắc rồi chạm [PHÁT] để Echo nạp lõi.',
    stuckHint: 'Chỉ Đòn Mạnh [E] của Echo đánh trúng vòng thu phía Bắc mới tích điện cho Bộ Thu (duy trì 7 giây).',
  },
  puzzle_combine: {
    badge: 'GIẢI ĐỐ 3/3',
    shortTitle: 'CỘNG HƯỞNG KÉP (KẾT HỢP)',
    desktopPrompt: 'Nhấn [T] ghi liền 1 đoạn vừa tung Đòn Mạnh [E] vào Bộ Thu Bắc VÀ bước lên Bệ 02 (-8.2, 10.2), rồi nhấn [Y] và qua cổng.',
    mobilePrompt: 'Chạm [GHI], đánh [MẠNH] vào Bộ Thu Bắc rồi bước lên Bệ 02, chạm [PHÁT] và đi qua Cổng Cuối.',
    stuckHint: 'Khi Echo vừa nạp điện Bộ Thu Bắc vừa đứng giữ Bệ 02 (-8.2, 10.2), điều khiển Sera băng qua cổng (-11.8, 10.2).',
  },
  boss_counterplay: {
    badge: 'KHẮC CHẾ TRÙM',
    shortTitle: 'KHẮC CHẾ THỐNG LĨNH HELIX-04',
    desktopPrompt: 'Né sang bên khi nó Húc Thẳng, Đỡ Đòn [Q] chiêu Quét Xoắn (+35 Flux), và nối Đòn Mạnh [E] sau dấu Echo Vàng (+22 Choáng).',
    mobilePrompt: 'Né vạch cảnh báo đỏ, chạm [ĐỠ ĐÒN] trước đòn quét, và đánh [MẠNH] nối tiếp dấu Echo Vàng.',
    stuckHint: 'Giáp trước của HELIX-04 giảm sát thương nhẹ — hãy Đỡ Đòn [Q] hoặc phối hợp Đòn Mạnh Echo + Đòn Mạnh Sera [E].',
  },
  choir_harmonic_nodes: {
    badge: 'CHƯƠNG II',
    shortTitle: 'ĐỒNG BỘ TRỤ ÂM THANH THE CHOIR',
    desktopPrompt: 'Dùng đòn đánh Echo ([T] -> [E] -> [Y]) kích hoạt 1 Trụ Âm Thanh, rồi dùng Sera đánh trụ liên kết trong 8.5 giây để phá khiên.',
    mobilePrompt: 'Dùng Echo kích hoạt 1 Trụ Âm Thanh ([GHI] -> [MẠNH] -> [PHÁT]), rồi điều khiển Sera đánh trụ tiếp theo.',
    stuckHint: 'Ghi [T] đòn đánh cạnh Trụ I (-5.4, -2.2), Phát [Y] cho Echo kích hoạt, rồi chạy sang đánh Trụ II (5.4, -2.2) hoặc Trụ III (0, 3.8).',
  },
  curator_gravity_pin: {
    badge: 'CHƯƠNG III',
    shortTitle: 'THE CURATOR & GHIM TRỌNG LỰC [G]',
    desktopPrompt: 'Quan sát các bóng ma False-Echo nhấp nháy và nhấn [G] (30 Flux) để Ghim Trọng Lực mồi nhử & ngắt chiêu THE CURATOR.',
    mobilePrompt: 'Né vệt thương tái tạo và chạm [GHIM G] (30 Flux) để khóa chặt bóng ma mồi nhử cùng THE CURATOR.',
    stuckHint: 'Nhấn [G] khi có >=30 Flux trong tầm 9.5m quanh bóng ma False-Echo hoặc THE CURATOR để khóa cứng mục tiêu.',
  },
  matron_echo_collapse: {
    badge: 'CHƯƠNG IV',
    shortTitle: 'MATRON-V & KÍCH NỔ ECHO [X]',
    desktopPrompt: 'Diệt sớm robot Hút Flux, tránh vòng đỏ Cắt Đứt, và nhấn [X] (25 Flux) khi đang có Echo để Kích Nổ gây Choáng diện rộng.',
    mobilePrompt: 'Tránh vòng đỏ Cắt Đứt và chạm [NỔ ECHO X] (25 Flux) khi Echo đang chạy để kích nổ sát thương lớn.',
    stuckHint: 'Triệu hồi Echo bằng [Y] áp sát MATRON-V rồi nhấn [X] (25 Flux) để tạo vụ nổ Echo Collapse.',
  },
  chronicle_loom_choice: {
    badge: 'CHƯƠNG V',
    shortTitle: 'VÒNG LẶP CUỐI: KHUNG CỬI BIÊN NIÊN',
    desktopPrompt: 'Đã khuất phục mọi Thống Lĩnh WARDEN. Chọn chỉ thị kết cục: [1] TĨNH LẶNG, [2] NHÂN CHỨNG hoặc [3] TIẾP NỐI.',
    mobilePrompt: 'Chạm chọn TĨNH LẶNG, NHÂN CHỨNG hoặc TIẾP NỐI trên Bảng Điều Khiển Khung Cửi để khép lại chiến dịch.',
    stuckHint: 'Mở Bảng Điều Khiển Khung Cửi trung tâm để đưa ra lựa chọn kết thúc chiến dịch.',
  },
  completed: {
    badge: 'HOÀN TẤT',
    shortTitle: 'ĐÃ XÁC MINH HIỆU CHUẨN',
    desktopPrompt: 'Toàn bộ giao thức hiệu chuẩn đã hoàn tất.',
    mobilePrompt: 'Toàn bộ giao thức hiệu chuẩn đã hoàn tất.',
    stuckHint: '',
  },
};

export function localizeTutorialHud(
  tutorial: {
    step: TutorialStep;
    title: string;
    desktopPrompt: string;
    mobilePrompt: string;
    stuckHint: string;
  },
  fallbackBadge: string,
  locale: AppLocale
): {
  badge: string;
  shortTitle: string;
  desktopPrompt: string;
  mobilePrompt: string;
  stuckHint: string;
} {
  const defaultShortTitle = tutorial.title.replace(
    /^(STEP\s+\d+|CALIBRATION\s+\d\/\d|CHAPTER\s+[IVX]+|CONTAINMENT\s+WARDEN)\s*·\s*/i,
    ''
  );
  if (locale !== 'vi') {
    return {
      badge: fallbackBadge,
      shortTitle: defaultShortTitle,
      desktopPrompt: tutorial.desktopPrompt,
      mobilePrompt: tutorial.mobilePrompt,
      stuckHint: tutorial.stuckHint,
    };
  }
  const vi = TUTORIAL_STEP_VI[tutorial.step];
  if (!vi) {
    return {
      badge: fallbackBadge,
      shortTitle: defaultShortTitle,
      desktopPrompt: tutorial.desktopPrompt,
      mobilePrompt: tutorial.mobilePrompt,
      stuckHint: tutorial.stuckHint,
    };
  }
  return vi;
}

export function localizeBenchActionMessage(msg: string, locale: AppLocale): string {
  if (locale !== 'vi' || !msg) return msg;
  if (msg === 'MOD SOCKET CLEARED') {
    return 'ĐÃ THÁO CHIP NÂNG CẤP KHỎI KHE CẮM';
  }
  if (msg.endsWith(' SOCKETED')) {
    const chipName = msg
      .slice(0, -' SOCKETED'.length)
      .replace('VOLT-ARC CAPACITOR', 'CHIP TỤ ĐIỆN HỒ QUANG')
      .replace('CRYO-STASIS INJECTOR', 'CHIP PHUN BĂNG ĐÔNG TRỄ')
      .replace('CHRONO-LEECH CORE', 'CHIP LÕI HÚT SINH LỰC');
    return `ĐÃ LẮP CHIP NÂNG CẤP · ${chipName}`;
  }
  if (msg.startsWith('UPGRADE BENCH READY')) {
    return 'BÀN NÂNG CẤP SẴN SÀNG · THU THẬP MẢNH KÝ ỨC TỪ CÁC MỐC CHIẾN DỊCH & HÒM MẬT';
  }
  if (msg.startsWith('SENTINEL PROTOCOL · ')) {
    return msg
      .replace('SENTINEL PROTOCOL · ', 'GIAO THỨC DRONE · ')
      .replace('LYS-04 STANDBY', 'LYS-04 CHẾ ĐỘ CHỜ')
      .replace('LYS-04 AEGIS WARD', 'LYS-04 KHIÊN HỘ VỆ AEGIS')
      .replace('LYS-04 INTERCEPTOR', 'LYS-04 PHÁO TIÊU DIỆT')
      .replace('LYS-04 HARMONIC AMP', 'LYS-04 KHUẾCH ĐẠI ECHO');
  }
  if (msg.startsWith('ECHO DOCTRINE · ')) {
    return msg
      .replace('ECHO DOCTRINE · ', 'HỌC THUYẾT VỌNG ẢNH · ')
      .replace('CALIBRATED ECHO', 'VỌNG ẢNH CHUẨN')
      .replace('VANGUARD STRIKE', 'TIÊN PHONG XUNG KÍCH')
      .replace('BASTION ANCHOR', 'PHÁO ĐÀI HỘ VỆ')
      .replace('PARADOX NOVA', 'TÂN TINH NGHỊCH LÝ');
  }
  if (msg.startsWith('MYTHIC AWAKENED ')) {
    return msg
      .replace('MYTHIC AWAKENED ', 'ĐÃ THỨC TỈNH THẦN THOẠI ')
      .replace('FRAGMENTS)', 'MẢNH)');
  }
  if (msg.startsWith('OVERCLOCKED ')) {
    return msg
      .replace('OVERCLOCKED ', 'ĐÃ ÉP XUNG ')
      .replace(' TO MK.II ', ' LÊN MK.II ')
      .replace('FRAGMENT)', 'MẢNH)');
  }
  if (msg.startsWith('UNLOCKED ')) {
    return msg.replace('UNLOCKED ', 'ĐÃ MỞ KHÓA ').replace('FRAGMENTS)', 'MẢNH)');
  }
  if (msg === 'BOSS ECHO CORE UNEQUIPPED') {
    return 'ĐÃ THÁO LÕI VỌNG ÂM THỐNG LĨNH';
  }
  if (msg.startsWith('SYNTHESIZED ')) {
    return msg
      .replace('SYNTHESIZED ', 'ĐÃ TỔNG HỢP ')
      .replace('AEGIS BASTION CORE', 'LÕI PHÁO ĐÀI AEGIS')
      .replace('HARMONIC BELL CORE', 'LÕI CHUÔNG CỘNG HƯỞNG')
      .replace('GRAVITY WELL CORE', 'LÕI DỊ ĐIỂM HẤP DẪN')
      .replace('NANITE SIPHON CORE', 'LÕI HÚT SINH LỰC NANITE')
      .replace('CHRONICLE SOVEREIGN CORE', 'LÕI BIÊN NIÊN TỐI THƯỢNG')
      .replace('FRAGMENTS)', 'MẢNH)');
  }
  if (msg.startsWith('OMEGA AWAKENED · ')) {
    return msg
      .replace('OMEGA AWAKENED · ', 'ĐÃ THỨC TỈNH OMEGA · ')
      .replace('AEGIS BASTION CORE', 'LÕI PHÁO ĐÀI AEGIS')
      .replace('HARMONIC BELL CORE', 'LÕI CHUÔNG CỘNG HƯỞNG')
      .replace('GRAVITY WELL CORE', 'LÕI DỊ ĐIỂM HẤP DẪN')
      .replace('NANITE SIPHON CORE', 'LÕI HÚT SINH LỰC NANITE')
      .replace('CHRONICLE SOVEREIGN CORE', 'LÕI BIÊN NIÊN TỐI THƯỢNG')
      .replace('FRAGMENTS)', 'MẢNH)');
  }
  if (msg.startsWith('EQUIPPED ')) {
    return msg
      .replace('EQUIPPED ', 'ĐÃ TRANG BỊ ')
      .replace('AEGIS BASTION CORE', 'LÕI PHÁO ĐÀI AEGIS')
      .replace('HARMONIC BELL CORE', 'LÕI CHUÔNG CỘNG HƯỞNG')
      .replace('GRAVITY WELL CORE', 'LÕI DỊ ĐIỂM HẤP DẪN')
      .replace('NANITE SIPHON CORE', 'LÕI HÚT SINH LỰC NANITE')
      .replace('CHRONICLE SOVEREIGN CORE', 'LÕI BIÊN NIÊN TỐI THƯỢNG');
  }
  if (msg.startsWith('UNEQUIPPED ')) {
    return msg.replace('UNEQUIPPED ', 'ĐÃ THÁO MOD KHỎI ');
  }
  if (msg.startsWith('NEURAL PROTOCOL INSTALLED')) {
    return msg
      .replace('NEURAL PROTOCOL INSTALLED · ', 'ĐÃ CÀI ĐẶT GIAO THỨC THẦN KINH · ')
      .replace('FRAGMENTS)', 'MẢNH)');
  }
  if (msg.startsWith('INSUFFICIENT MEMORY FRAGMENTS')) {
    return msg
      .replace('INSUFFICIENT MEMORY FRAGMENTS', 'KHÔNG ĐỦ MẢNH KÝ ỨC')
      .replace('REQUIRED FOR MK.III)', 'CẦN CHO MK.III)')
      .replace('REQUIRED FOR MK.II)', 'CẦN CHO MK.II)')
      .replace('REQUIRED FOR ', 'CẦN CHO ')
      .replace('REQUIRED)', 'CẦN THIẾT)');
  }
  if (msg.startsWith('SAVED LOADOUT PRESET · ')) {
    return msg.replace('SAVED LOADOUT PRESET · ', 'ĐÃ LƯU BỘ TRANG BỊ · ');
  }
  if (msg.startsWith('LOADED LOADOUT PRESET · ')) {
    return msg.replace('LOADED LOADOUT PRESET · ', 'ĐÃ NẠP BỘ TRANG BỊ · ');
  }
  if (msg === 'LOADOUT PRESET SLOT IS EMPTY') {
    return 'KHE BỘ TRANG BỊ NÀY ĐANG TRỐNG';
  }
  if (msg === 'CANNOT LOAD PRESET DURING COMMITTED COMBAT OR DEFEAT') {
    return 'KHÔNG THỂ NẠP BỘ TRANG BỊ KHI ĐANG TUNG CHIÊU HOẶC ĐÃ BẠI TRẬN';
  }
  return msg;
}

const ENEMY_TACTICAL_VI_MAP: Record<string, string> = {
  // Role labels
  'AEGIS BULWARK': 'KHIÊN CHẮN AEGIS',
  'PHALANX SENTINEL': 'HỘ VỆ GIÁP NẶNG',
  'FLANKING SKIRMISHER': 'XUNG KÍCH BỌC SƯỜN',
  'PHANTOM SKIRMISHER': 'ẢO ẢNH XUNG KÍCH',
  'RANGED SUPPRESSOR': 'XẠ THỦ ÁP CHẾ',
  'PHASE SUPPRESSOR': 'ỨC CHẾ NĂNG LƯỢNG',
  'FLUX EXTRACTOR': 'RÚT NĂNG LƯỢNG FLUX',
  'ECHO NULLIFIER': 'TRIỆT TIÊU ECHO',
  'PHASE BLINK ASSASSIN': 'SÁT THỦ DỊCH CHUYỂN',
  'SIEGE MORTAR TRIPOD': 'PHÁO CỐI ĐỊA CHẤN',
  'HARMONIC CONDUCTOR': 'NHẠC TRƯỞNG CỘNG HƯỞNG',
  'BOSS ENCOUNTER': 'THỐNG LĨNH KHU VỰC',
  // Status labels
  ENGAGED: 'ĐANG GIAO CHIẾN',
  'GRAVITY PINNED': 'ĐANG BỊ GHIM TRỌNG LỰC',
  'POSTURE BROKEN · 1.5x DMG': 'VỠ TƯ THẾ · 1.5x SÁT THƯƠNG',
  'SHIELD OPEN · 1.5x VULNERABLE': 'HỞ KHIÊN · 1.5x SÁT THƯƠNG',
  'VULNERABLE RECOVERY · 1.5x DMG': 'SƠ HỞ THU HỒI · 1.5x SÁT THƯƠNG',
  'PULSE AIM LOCKED · DODGE OR BREAK': 'KHÓA ĐƯỜNG BẮN · NÉ HOẶC ĐÁNH MẠNH',
  'CALIBRATING PULSE · HEAVY BREAKS': 'ĐANG NGẮM XUNG · ĐÒN MẠNH NGẮT CHIÊU',
  'SUPPRESSION BOLT LOCKED · DODGE OR BREAK LOS': 'KHÓA ĐẠN ỨC CHẾ · NÉ HOẶC NẤP',
  'CHARGING FLUX DAMPENER · HEAVY BREAKS': 'NẠP ĐẠN ỨC CHẾ · ĐÒN MẠNH NGẮT CHIÊU',
  'COUNTER-SWEEP COMMITTED · PARRY/DODGE': 'VUNG CHÙY PHẢN KÍCH · ĐỠ [Q] / NÉ',
  'MAUL WINDUP · PARRY OR FLANK': 'LẤY ĐÀ VUNG CHÙY · ĐỠ ĐÒN HOẶC VÒNG SAU',
  'LUNGE COMMITTED · DODGE LATERAL': 'LAO TỚI CHÉM · NÉ SANG BÊN',
  'COILING LUNGE · PARRY/DODGE': 'LẤY ĐÀ LAO TỚI · ĐỠ [Q] / NÉ',
  'PHASE BLINK SLASH · PARRY [Q] OR SIDESTEP': 'CHÉM DỊCH CHUYỂN · ĐỠ [Q] HOẶC NÉ NGANG',
  'MORTAR BARRAGE LOCKING · EVADE BLAST RINGS': 'ĐANG KHÓA PHÁO CỐI · TRÁNH VÒNG ĐỎ',
  'HARMONIC PULSE · STAGGER TO SEVER TETHER': 'XUNG CỘNG HƯỞNG · ĐÁNH CHOÁNG ĐỂ CẮT DÂY',
  'SIPHON STRIKE · DRAINS 22 FLUX': 'ĐÒN HÚT NĂNG LƯỢNG · MẤT 22 FLUX',
  'ANTI-ECHO PULSE · SEVERS REPLAY': 'XUNG DIỆT ECHO · CẮT ĐỨT PHÂN THÂN',
  'ATTACK TELEGRAPH': 'ĐANG RA ĐÒN',
  'ACTIVE STRIKE': 'ĐANG TẤN CÔNG',
  'FRONTAL BARRIER · 82% MITIGATION (USE GRAV-BREAKER OR FLANK)':
    'GIÁP CHẮN TRƯỚC · GIẢM 82% ST (DÙNG BÚA [4] / VÒNG SAU)',
  'FLANK OPEN · 1.0x UNGUARDED DMG': 'HỞ SƯỜN · 1.0x SÁT THƯƠNG TRỰC TIẾP',
  'FRONTAL GUARD · 0.42x DMG (FLANK/HEAVY)':
    'KHIÊN CHẮN TRƯỚC · 0.42x ST (VÒNG SAU / ĐÒN MẠNH)',
  'STANDOFF ORBIT · USE COVER OR RANGED': 'GIỮ KHOẢNG CÁCH · DÙNG CHƯỚNG NGẠI / BẮN TRẢ',
  'PHASE SUPPRESSOR · DAMPENS FLUX ON HIT': 'ỨC CHẾ PHA · GIẢM HỒI FLUX KHI TRÚNG',
  'BLINK ASSASSIN · TELEPORTS TO FLANK': 'SÁT THỦ PHA · DỊCH CHUYỂN BỌC SƯỜN',
  'SIEGE ARTILLERY · RUSH OR RANGED INTERRUPT': 'PHÁO TẦM XA · ÁP SÁT HOẶC BẮN NGẮT',
  'TETHER ACTIVE · +25% ALLY DR & REGEN (STAGGER TO BREAK)':
    'ĐANG NỐI DÂY · +25% GIÁP ĐỒNG MINH (ĐÁNH CHOÁNG ĐỂ CẮT)',
  'HARMONIC CONDUCTOR · SEEKING ALLY LINK': 'NHẠC TRƯỞNG · ĐANG TÌM ĐỒNG MINH NỐI DÂY',
  'FLANKING APPROACH · LOW POSTURE': 'ÁP SÁT BỌC SƯỜN · TƯ THẾ YẾU',
  'HUNTING FLUX · PRIORITIZE': 'SĂN HÚT FLUX · ƯU TIÊN HẠ TRƯỚC',
  'HUNTING ACTIVE ECHO': 'SĂN DIỆT PHÂN THÂN ECHO',
};

export function localizeEnemyTacticalText(
  text: string | null | undefined,
  locale: AppLocale
): string {
  if (!text) return '';
  if (locale !== 'vi') return text;
  return ENEMY_TACTICAL_VI_MAP[text] ?? text;
}

export const CAMPAIGN_CHAPTER_DRAWER_VI: Record<
  CampaignChapterId,
  { label: string; subtitle: string; description: string; unlockRequirement: string }
> = {
  prologue: {
    label: 'MỞ ĐẦU · KHOANG 04',
    subtitle: 'Vòng Lặp #413 Thức Tỉnh',
    description: 'Đồng bộ Chrono Rig qua 3 bước giải đố Echo và vượt đội tuần tra đầu tiên tại Khoang Hiệu Chuẩn 04.',
    unlockRequirement: 'Mở sẵn từ đầu chiến dịch',
  },
  chapter_1_helix: {
    label: 'CHƯƠNG I · KHU 01',
    subtitle: 'Thống Lĩnh An Ninh HELIX-04',
    description: 'Xuyên thủng khiên chắn Aegis của HELIX-04 và khôi phục hồ sơ phong tỏa thật sự của Khu 07.',
    unlockRequirement: 'Hoàn thành Mở Đầu tại Khoang 04',
  },
  chapter_2_choir: {
    label: 'CHƯƠNG II · KHU 02',
    subtitle: 'Dàn Đồng Ca THE CHOIR',
    description: 'Phối hợp Echo lệch pha trên các Trụ Âm Thanh để giải thoát 300 giọng nói bị lặp trong Vườn Thủy Canh.',
    unlockRequirement: 'Đánh bại HELIX-04 ở Chương I',
  },
  chapter_3_curator: {
    label: 'CHƯƠNG III · KHU 03',
    subtitle: 'Kẻ Lưu Trữ THE CURATOR',
    description: 'Dùng Ghim Trọng Lực [G] vạch trần lũ bóng ma False-Echo và giải mã bản kiểm định Vòng 412 của Lysa.',
    unlockRequirement: 'Đánh bại THE CHOIR ở Chương II',
  },
  chapter_4_matron: {
    label: 'CHƯƠNG IV · KHU 04',
    subtitle: 'Phẫu Thuật Viên MATRON-V',
    description: 'Kích Nổ Echo [X] phá tan trường cắt bỏ y tế của MATRON-V và nhận Ấn Ghi Đè cuối cùng từ Nôi 04.',
    unlockRequirement: 'Đánh bại THE CURATOR ở Chương III',
  },
  chapter_5_loom: {
    label: 'CHƯƠNG V · ĐẠI KẾT CỤC',
    subtitle: 'Lõi Khung Cửi & WARDEN PRIME',
    description: 'Đối đầu Kiến Trúc Sư Tối Thượng WARDEN PRIME và quyết định vận mệnh cuối cùng của Lysa cùng Nadir-9.',
    unlockRequirement: 'Thu hồi đủ 4 Ấn Ghi Đè qua Chương IV',
  },
};
