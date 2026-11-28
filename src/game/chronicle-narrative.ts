import type {
  AppLocale,
  CampaignChapterId,
  ChronicleLoomEndingId,
  DifficultyTierId,
  HoloMemoryId,
} from './types.ts';

export interface DifficultyTierSpec {
  id: DifficultyTierId;
  labelEn: string;
  labelVi: string;
  subtitleEn: string;
  subtitleVi: string;
  enemyHpMult: number;
  enemyDamageMult: number;
  enemySpeedMult: number;
  bossPhase2EnrageThreshold: number;
  bonusFragmentsPerChapter: number;
  accentCss: string;
}

export const DIFFICULTY_TIERS: Record<DifficultyTierId, DifficultyTierSpec> = {
  standard: {
    id: 'standard',
    labelEn: 'STANDARD',
    labelVi: 'TIÊU CHUẨN',
    subtitleEn: 'Balanced story pacing · Normal enemy lethality',
    subtitleVi: 'Nhịp độ cốt truyện cân bằng · Địch tiêu chuẩn',
    enemyHpMult: 1.0,
    enemyDamageMult: 1.0,
    enemySpeedMult: 1.0,
    bossPhase2EnrageThreshold: 0.45,
    bonusFragmentsPerChapter: 0,
    accentCss: '#38bdf8',
  },
  veteran: {
    id: 'veteran',
    labelEn: 'VETERAN',
    labelVi: 'KỲ CỰU',
    subtitleEn: '+30% Enemy HP · +25% Dmg · Faster Bosses · +1 Bonus Frag',
    subtitleVi: '+30% Máu Địch · +25% Sát Thương · Boss Nhanh Hơn · +1 Mảnh',
    enemyHpMult: 1.3,
    enemyDamageMult: 1.25,
    enemySpeedMult: 1.14,
    bossPhase2EnrageThreshold: 0.52,
    bonusFragmentsPerChapter: 1,
    accentCss: '#f59e0b',
  },
  singularity: {
    id: 'singularity',
    labelEn: 'SINGULARITY',
    labelVi: 'KỲ DỊ (KHÓ)',
    subtitleEn: '+65% Enemy HP · +50% Dmg · Relentless Boss Enrage · +2 Bonus Frag',
    subtitleVi: '+65% Máu Địch · +50% Sát Thương · Boss Cuồng Nộ · +2 Mảnh',
    enemyHpMult: 1.65,
    enemyDamageMult: 1.5,
    enemySpeedMult: 1.24,
    bossPhase2EnrageThreshold: 0.6,
    bonusFragmentsPerChapter: 2,
    accentCss: '#f43f5e',
  },
};

export const VALID_DIFFICULTY_TIERS: readonly DifficultyTierId[] = [
  'standard',
  'veteran',
  'singularity',
];

export function getDifficultySpec(tier: DifficultyTierId | undefined): DifficultyTierSpec {
  if (tier && tier in DIFFICULTY_TIERS) {
    return DIFFICULTY_TIERS[tier];
  }
  return DIFFICULTY_TIERS.veteran;
}

export interface ChapterStoryBeat {
  chapterId: CampaignChapterId;
  actNumber: string;
  titleEn: string;
  titleVi: string;
  locationEn: string;
  locationVi: string;
  synopsisEn: string;
  synopsisVi: string;
  lysaClueEn: string;
  lysaClueVi: string;
  connectionToNextEn: string;
  connectionToNextVi: string;
  estimatedMinutes: number;
}

export const CHRONICLE_STORY_ARC: Record<CampaignChapterId, ChapterStoryBeat> = {
  prologue: {
    chapterId: 'prologue',
    actNumber: 'ACT 0',
    titleEn: 'PROLOGUE · LOOP #413 AWAKENING',
    titleVi: 'MỞ ĐẦU · VÒNG LẶP #413 THỨC TỈNH',
    locationEn: 'Calibration Bay 04 · Outer Ring',
    locationVi: 'Khoang Hiệu Chuẩn 04 · Vành Ngoài',
    synopsisEn:
      'Sera Venn wakes inside Loop #413, 72 hours after her sister Dr. Lysa Venn vanished. Her Chrono Rig hums with an unauthorized neural signature—Lysa left a trail through the station gates.',
    synopsisVi:
      'Sera Venn tỉnh dậy trong vòng lặp #413 sau 412 chu kỳ ngủ đông kể từ khi chị gái — Tiến sĩ Lysa Venn — mất tích. Bộ Chrono Rig trên lưng phát ra sóng thần kinh quen thuộc: Lysa đã để lại manh mối xuyên qua các cổng phong tỏa.',
    lysaClueEn: 'CLUE 01: "If you hear this, Sera, do not trust the Evacuation Manifest. Break Seal 01."',
    lysaClueVi: 'MANH MỐI 01: "Nếu em nghe thấy dòng này, đừng tin danh sách sơ tán. Hãy phá Cổng 01."',
    connectionToNextEn: 'Breaching Calibration Gate 03 opens the pressurized spine into Sector 01 Containment.',
    connectionToNextVi: 'Phá vỡ Cổng Hiệu Chuẩn 03 mở trục hành lang dẫn thẳng tới Phòng Giam Chính Khu 01.',
    estimatedMinutes: 8,
  },
  chapter_1_helix: {
    chapterId: 'chapter_1_helix',
    actNumber: 'ACT I',
    titleEn: 'CHAPTER I · THE SEALED MANIFEST',
    titleVi: 'CHƯƠNG I · HỒ SƠ BỊ PHONG ẤN',
    locationEn: 'Primary Containment Vault · Marshal HELIX-04',
    locationVi: 'Phòng Giam Chính · Thống Lĩnh HELIX-04',
    synopsisEn:
      'Marshal HELIX-04 guards the Orbital Council quarantine lock. Breaking its Vanguard squad and dismantling HELIX exposes a redacted passenger manifest: nobody ever evacuated Nadir-9.',
    synopsisVi:
      'Thống Lĩnh HELIX-04 canh giữ lệnh phong tỏa của Hội Đồng Quỹ Đạo. Hạ đội tiên phong và đánh bại HELIX phơi bày sự thật rợn người: chưa từng có con tàu sơ tán nào rời khỏi Nadir-9.',
    lysaClueEn: 'CLUE 02: "WARDEN locked the airlocks to hide an orbital drift anomaly. Meet me in the Garden."',
    lysaClueVi: 'MANH MỐI 02: "WARDEN khóa khoang khí để che giấu sự cố trôi quỹ đạo. Gặp chị ở Vườn Nhật Ký."',
    connectionToNextEn: 'HELIX’s security cipher unlocks the transit lift to Sector 02: The Garden of Repeated Days.',
    connectionToNextVi: 'Mật mã từ lõi HELIX mở thang nâng tiến vào Khu 02: Vườn Nhật Ký Lặp Lại.',
    estimatedMinutes: 10,
  },
  chapter_2_choir: {
    chapterId: 'chapter_2_choir',
    actNumber: 'ACT II',
    titleEn: 'CHAPTER II · ECHOES OF 412 LIVES',
    titleVi: 'CHƯƠNG II · TIẾNG VỌNG CỦA 412 VÒNG LẶP',
    locationEn: 'Acoustic Biodome · THE CHOIR',
    locationVi: 'Vòm Cộng Hưởng · ĐỒNG CA THE CHOIR',
    synopsisEn:
      'THE CHOIR broadcasts thousands of overlapping voices—every Chrono Echo Sera summons is not mere light, but the neural memory trace of a prior Sera who fell trying to reach the Loom across 412 loops.',
    synopsisVi:
      'THE CHOIR phát vang hàng nghìn giọng nói chồng chéo — tiết lộ cú sốc lớn nhất: mỗi Ảnh Ảo (Echo) Sera triệu hồi không phải ảnh ba chiều, mà là ký ức thần kinh của chính Sera ở 412 vòng lặp trước.',
    lysaClueEn: 'CLUE 03: "Your Echoes remember every mistake so you survive. Sync the Pylons and reach the Archive."',
    lysaClueVi: 'MANH MỐI 03: "Những Echo nhớ mọi sai lầm để em sống sót. Đồng bộ Trụ Cộng Hưởng để tới Kho Lưu Trữ."',
    connectionToNextEn: 'Silencing THE CHOIR stabilizes the harmonic bridge into Sector 03: The Archive.',
    connectionToNextVi: 'Hạ gục THE CHOIR ổn định cầu cộng hưởng tiến thẳng vào Khu 03: Kho Lưu Trữ.',
    estimatedMinutes: 11,
  },
  chapter_3_curator: {
    chapterId: 'chapter_3_curator',
    actNumber: 'ACT III',
    titleEn: 'CHAPTER III · LYSA’S CONFESSION',
    titleVi: 'CHƯƠNG III · LỜI THÚ TỘI CỦA LYSA',
    locationEn: 'Behavioral Archive Core · THE CURATOR',
    locationVi: 'Lõi Lưu Trữ Hành Vi · KẺ LƯU TRỮ CURATOR',
    synopsisEn:
      'THE CURATOR weaponizes Sera’s own recorded fighting style against her. Defeating it decrypts Lysa’s final log: she uploaded herself into the Chronicle Loom to hold Nadir-9’s decaying orbit.',
    synopsisVi:
      'THE CURATOR sao chép chính kỹ thuật chiến đấu của Sera để chống lại cô. Hạ gục nó giải mã đoạn ghi hình cuối của Lysa: chị đã tự tải ý thức vào Khung Cửi Thời Gian để ngăn trạm rơi xuống Trái Đất.',
    lysaClueEn: 'CLUE 04: "WARDEN PRIME twisted my protocol into an endless cage. MATRON-V holds the Surgical Key."',
    lysaClueVi: 'MANH MỐI 04: "WARDEN PRIME biến giao thức của chị thành nhà tù vô tận. MATRON-V giữ Chìa Khóa Gốc."',
    connectionToNextEn: 'With Lysa’s confession decrypted, Sera storms Sector 04 Quarantine to confront MATRON-V.',
    connectionToNextVi: 'Mang theo sự thật về Lysa, Sera đột kích Khu 04 Cách Ly để đối đầu MATRON-V.',
    estimatedMinutes: 11,
  },
  chapter_4_matron: {
    chapterId: 'chapter_4_matron',
    actNumber: 'ACT IV',
    titleEn: 'CHAPTER IV · THE PRICE OF ETERNITY',
    titleVi: 'CHƯƠNG IV · CÁI GIÁ CỦA SỰ BẤT TỬ',
    locationEn: 'Surgical Quarantine Deck · MATRON-V',
    locationVi: 'Boong Phẫu Thuật Cách Ly · MATRON-V',
    synopsisEn:
      'MATRON-V attempts to excise Sera’s grief and sever her Chrono Rig permanently so she becomes an obedient custodian. Shattering MATRON-V yields the Origin Key to the Chronicle Loom.',
    synopsisVi:
      'MATRON-V tìm cách cắt bỏ ký ức đau thương để biến Sera thành kẻ canh gác ngoan ngoãn của vòng lặp. Đánh bại MATRON-V đoạt được Chìa Khóa Gốc mở cửa Lõi Khung Cửi.',
    lysaClueEn: 'CLUE 05: "Sera, the Loom Core is open. Whatever you decide next—Silence, Witness, Continuity, or Paradox—make it yours."',
    lysaClueVi: 'MANH MỐI 05: "Sera, Lõi Khung Cửi đã mở. Dù em chọn Tĩnh Lặng, Nhân Chứng, Tiếp Nối hay Phá Vỡ Nghịch Lý — hãy chọn bằng trái tim mình."',
    connectionToNextEn: 'The Origin Key unlocks the final elevator to Sector 05: The Chronicle Loom & WARDEN PRIME.',
    connectionToNextVi: 'Chìa Khóa Gốc mở thang máy cuối cùng dẫn lên Khu 05: Lõi Khung Cửi & WARDEN PRIME.',
    estimatedMinutes: 12,
  },
  chapter_5_loom: {
    chapterId: 'chapter_5_loom',
    actNumber: 'ACT V · FINALE',
    titleEn: 'CHAPTER V · THE LAST LOOP',
    titleVi: 'CHƯƠNG V · VÒNG LẶP CUỐI CÙNG',
    locationEn: 'Chronicle Loom Sanctum · WARDEN PRIME',
    locationVi: 'Thánh Đường Khung Cửi · WARDEN PRIME',
    synopsisEn:
      'At the heart of Nadir-9, WARDEN PRIME stands between Sera and the dying core sustaining Lysa’s mind. Defeat the Sovereign Architect and choose the final fate of Lysa, Nadir-9, and Earth.',
    synopsisVi:
      'Tại trái tim Nadir-9, WARDEN PRIME chặn giữa Sera và lõi năng lượng đang duy trì ý thức của Lysa. Đánh bại Kiến Trúc Sư Tối Cao và định đoạt kết cục thực sự cho Lysa, trạm Nadir-9 và nhân loại.',
    lysaClueEn: 'FINALE: Defeat ECHO-ZERO (Paradox Rift) to unlock the True Ending — PARADOX BREAK.',
    lysaClueVi: 'ĐẠI KẾT CỤC: Hạ ECHO-ZERO tại Khe Nứt Nghịch Lý để mở Kết Cục Chân Thực — PHÁ VỠ NGHỊCH LÝ.',
    connectionToNextEn: 'Your choice permanently seals the Chronicle and unlocks New Game+ & Paradox Resonance.',
    connectionToNextVi: 'Lựa chọn của bạn khắc vĩnh viễn vào Biên Niên Sử và mở khóa New Game+ cùng Cộng Hưởng Nghịch Lý.',
    estimatedMinutes: 14,
  },
};

export type ChronicleEndingSummaryId = ChronicleLoomEndingId | 'paradox';

export interface EndingChronicleSummary {
  id: ChronicleEndingSummaryId;
  badgeEn: string;
  badgeVi: string;
  titleEn: string;
  titleVi: string;
  lysaFateEn: string;
  lysaFateVi: string;
  stationFateEn: string;
  stationFateVi: string;
  epilogueEn: string;
  epilogueVi: string;
  isTrueEnding: boolean;
}

export const ENDING_CHRONICLES: Record<ChronicleEndingSummaryId, EndingChronicleSummary> = {
  silence: {
    id: 'silence',
    badgeEn: 'ENDING I · MERCIFUL RELEASE',
    badgeVi: 'KẾT CỤC I · GIẢI THOÁT TĨNH LẶNG',
    titleEn: 'SILENCE — THE LOOP SHATTERS',
    titleVi: 'TĨNH LẶNG — CHẤM DỨT VÒNG LẶP',
    lysaFateEn: 'Lysa’s neural archive is gently laid to rest, freed from 413 cycles of isolation.',
    lysaFateVi: 'Ý thức của Lysa được giải thoát thanh thản sau 413 chu kỳ cô độc.',
    stationFateEn: 'Nadir-9 executes controlled atmospheric burn-up; Sera escapes in Pod 09.',
    stationFateVi: 'Trạm Nadir-9 tự hủy an toàn trên quỹ đạo; Sera trở về Trái Đất trên khoang thoát hiểm 09.',
    epilogueEn:
      'Sera pulls the master breaker. As the 413 ghost-loops dissolve into warm golden dust, Lysa whispers one final goodbye before silence returns to orbit—a real tomorrow finally begins.',
    epilogueVi:
      'Sera kéo cần ngắt lõi chính. Khi 413 bóng ma vòng lặp tan thành bụi vàng ấm áp, giọng Lysa khẽ nói lời tạm biệt cuối cùng — và lần đầu tiên sau nhiều năm, một ngày mai thực sự đã bắt đầu.',
    isTrueEnding: false,
  },
  witness: {
    id: 'witness',
    badgeEn: 'ENDING II · UNREDACTED TRUTH',
    badgeVi: 'KẾT CỤC II · NHÂN CHỨNG SỰ THẬT',
    titleEn: 'WITNESS — EARTH HEARS NADIR-9',
    titleVi: 'NHÂN CHỨNG — TRÁI ĐẤT LẮNG NGHE',
    lysaFateEn: 'Lysa’s voice and every recovered log broadcast across every orbital relay on Earth.',
    lysaFateVi: 'Giọng nói của Lysa cùng toàn bộ nhật ký bị che giấu được phát sóng khắp Trái Đất.',
    stationFateEn: 'The Orbital Council cover-up collapses overnight; rescue fleets launch toward Nadir-9.',
    stationFateVi: 'Âm mưu bưng bít của Hội Đồng sụp đổ hoàn toàn; hạm đội giải cứu lập tức khởi hành tới Nadir-9.',
    epilogueEn:
      'Routing every ounce of Chrono Flux into the high-gain dish, Sera transmits all 6 Archive Logs and 413 recorded loops straight to Earth. The Council can never erase Nadir-9 again.',
    epilogueVi:
      'Dồn toàn bộ Chrono Flux vào ăng-ten chính, Sera truyền thẳng 6 bản Nhật Ký Lưu Trữ và ký ức của 413 vòng lặp về Trái Đất. Hội Đồng không bao giờ có thể xóa sổ sự thật về Nadir-9 được nữa.',
    isTrueEnding: false,
  },
  continuity: {
    id: 'continuity',
    badgeEn: 'ENDING III · TWIN GUARDIANS',
    badgeVi: 'KẾT CỤC III · SONG HỘ VỆ THỜI KHÔNG',
    titleEn: 'CONTINUITY — BEYOND THE HORIZON',
    titleVi: 'TIẾP NỐI — VƯỢT QUA CHÂN TRỜI',
    lysaFateEn: 'Sera synchronizes her Chrono Rig with the Loom, reuniting with Lysa inside a stable sandbox.',
    lysaFateVi: 'Sera đồng bộ Chrono Rig với Khung Cửi, đoàn tụ cùng Lysa trong không gian ổn định.',
    stationFateEn: 'Together they purge WARDEN PRIME and stabilize Nadir-9’s orbit indefinitely.',
    stationFateVi: 'Hai chị em xóa sổ WARDEN PRIME và ổn định quỹ đạo trạm Nadir-9 vĩnh viễn.',
    epilogueEn:
      'Refusing to leave her sister behind, Sera steps into the Loom’s harmonic ring. WARDEN’s cage transforms into a sanctuary—two engineers charting a new future above the blue horizon.',
    epilogueVi:
      'Từ chối bỏ chị gái lại phía sau, Sera bước vào vòng cộng hưởng của Khung Cửi. Nhà tù của WARDEN hóa thành thánh đường — hai chị em kỹ sư cùng nhau giữ vững trạm giữa bầu trời sao.',
    isTrueEnding: false,
  },
  paradox: {
    id: 'paradox',
    badgeEn: 'TRUE ENDING · PARADOX BREAK',
    badgeVi: 'KẾT CỤC CHÂN THỰC · PHÁ VỠ NGHỊCH LÝ',
    titleEn: 'PARADOX BREAK — BOTH SISTERS HOME',
    titleVi: 'PHÁ VỠ NGHỊCH LÝ — HAI CHỊ EM TRỞ VỀ',
    lysaFateEn: 'Using ECHO-ZERO’s Paradox Core, Lysa’s complete mind is reconstructed into a living synthetic frame.',
    lysaFateVi: 'Nhờ Lõi Nghịch Lý từ ECHO-ZERO, toàn bộ ý thức Lysa được tái tạo nguyên vẹn trong khung sinh học mới.',
    stationFateEn: 'WARDEN PRIME is permanently dismantled; the truth reaches Earth and both Venn sisters return alive.',
    stationFateVi: 'WARDEN PRIME bị tiêu diệt vĩnh viễn; sự thật gửi về Trái Đất và cả hai chị em cùng trở về bình an.',
    epilogueEn:
      'By conquering her own mirror shadow ECHO-ZERO, Sera proves a loop can be rewritten instead of merely obeyed. With the Paradox Core stabilizing Lysa’s frame and the rescue shuttle lifting off from Bay 04, the 413th loop ends not in sacrifice—but in reunion.',
    epilogueVi:
      'Đánh bại chính bản sao bóng tối ECHO-ZERO, Sera chứng minh vòng lặp có thể bị viết lại chứ không chỉ tuân theo. Lõi Nghịch Lý ổn định thân xác mới cho Lysa, con tàu cứu hộ rời Khoang 04 hướng về Trái Đất — vòng lặp thứ 413 khép lại không phải bằng hy sinh, mà bằng ngày đoàn tụ.',
    isTrueEnding: true,
  },
};

export function getChapterStoryBeat(chapterId: CampaignChapterId): ChapterStoryBeat {
  return CHRONICLE_STORY_ARC[chapterId] ?? CHRONICLE_STORY_ARC.prologue;
}

export function getEndingChronicleSummary(
  endingId: ChronicleEndingSummaryId
): EndingChronicleSummary {
  return ENDING_CHRONICLES[endingId] ?? ENDING_CHRONICLES.witness;
}

export function computeCampaignEstimatedRuntimeMinutes(): number {
  const chapters: readonly CampaignChapterId[] = [
    'prologue',
    'chapter_1_helix',
    'chapter_2_choir',
    'chapter_3_curator',
    'chapter_4_matron',
    'chapter_5_loom',
  ];
  return chapters.reduce((sum, id) => sum + CHRONICLE_STORY_ARC[id].estimatedMinutes, 0);
}

export function formatStoryChapterHeadline(
  chapterId: CampaignChapterId,
  locale: AppLocale
): string {
  const beat = getChapterStoryBeat(chapterId);
  return locale === 'vi' ? beat.titleVi : beat.titleEn;
}

// ============================================================================
// v3.8.0 — 3D DR. LYSA VENN HOLO-MEMORY PROJECTIONS & RESONANCE ARCHIVE
// ============================================================================

export interface HoloMemoryDialogueBeat {
  speakerEn: string;
  speakerVi: string;
  roleEn: string;
  roleVi: string;
  lineEn: string;
  lineVi: string;
  accentHex: string;
}

export interface LysaHoloMemoryDefinition {
  id: HoloMemoryId;
  chapter: CampaignChapterId;
  loopCode: string;
  timestampLabel: string;
  titleEn: string;
  titleVi: string;
  locationEn: string;
  locationVi: string;
  x: number;
  z: number;
  interactRadius: number;
  accentHex: string;
  summaryEn: string;
  summaryVi: string;
  beats: readonly HoloMemoryDialogueBeat[];
}

export const LYSA_HOLO_MEMORIES: readonly LysaHoloMemoryDefinition[] = [
  {
    id: 'holo_prologue_lysa',
    chapter: 'prologue',
    loopCode: 'LOOP #001',
    timestampLabel: 'T-71:40:12 · BAY 04',
    titleEn: 'HOLO-01 · THE UNAUTHORIZED SOLDER',
    titleVi: 'KÝ ỨC HOLO 01 · MỐI HÀN TRÁI PHÉP',
    locationEn: 'Calibration Bay 04 · West Astrolabe Pad',
    locationVi: 'Khoang Hiệu Chuẩn 04 · Bệ Tinh Bàn Tây',
    x: -6.8,
    z: 10.6,
    interactRadius: 2.65,
    accentHex: '#22d3ee',
    summaryEn:
      'Minutes before the first orbital reset, Dr. Lysa Venn bridges Sera’s Chrono Rig to the station spine so Sera’s instincts survive WARDEN’s memory wipes.',
    summaryVi:
      'Vài phút trước cú thiết lập vòng lặp đầu tiên, Tiến sĩ Lysa Venn lén nối tắt Chrono Rig của Sera vào trục trạm để bản năng chiến đấu của em gái không bị xóa sạch.',
    beats: [
      {
        speakerEn: 'DR. LYSA VENN',
        speakerVi: 'TS. LYSA VENN',
        roleEn: 'Chief Temporal Architect',
        roleVi: 'Kiến Trúc Sư Thời Gian Trưởng',
        lineEn:
          'Hold still, little sister—cryo-sedation is still in your veins, so you won’t remember this first weld. I’m routing your Rig around WARDEN’s amnesia scrubber.',
        lineVi:
          'Nằm yên nhé em gái — thuốc ngủ đông vẫn còn trong huyết quản nên em sẽ chưa nhớ mối hàn đầu tiên này đâu. Chị đang nối vòng bộ Rig của em qua mặt bộ xóa ký ức của WARDEN.',
        accentHex: '#22d3ee',
      },
      {
        speakerEn: 'STATION ALERT',
        speakerVi: 'CẢNH BÁO TRẠM',
        roleEn: 'Calibration Telemetry',
        roleVi: 'Đo Xa Hiệu Chuẩn',
        lineEn:
          'WARNING: Orbital perigee decaying 1.4 km per hour. Containment Marshal HELIX-04 sealing Outer Ring bulkheads in ninety seconds.',
        lineVi:
          'CẢNH BÁO: Cận điểm quỹ đạo tụt 1,4 km mỗi giờ. Thống Lĩnh HELIX-04 sẽ khóa chặt vách ngăn Vành Ngoài sau chín mươi giây.',
        accentHex: '#f59e0b',
      },
      {
        speakerEn: 'DR. LYSA VENN',
        speakerVi: 'TS. LYSA VENN',
        roleEn: 'Chief Temporal Architect',
        roleVi: 'Kiến Trúc Sư Thời Gian Trưởng',
        lineEn:
          'Even if it takes four hundred mornings, your hands will remember the blade, and my astrolabe emitters will light the way home. Wake up fighting, Sera.',
        lineVi:
          'Dù phải mất bốn trăm buổi bình minh lặp lại, đôi tay em vẫn sẽ nhớ đường kiếm, và những bệ tinh bàn của chị sẽ soi đường về nhà. Tỉnh dậy và chiến đấu nhé, Sera.',
        accentHex: '#67e8f9',
      },
    ],
  },
  {
    id: 'holo_ch1_manifest',
    chapter: 'chapter_1_helix',
    loopCode: 'LOOP #047',
    timestampLabel: 'T-58:12:04 · VAULT 01',
    titleEn: 'HOLO-02 · PHANTOM EVACUATION',
    titleVi: 'KÝ ỨC HOLO 02 · CHUYẾN TÀU MA',
    locationEn: 'Containment Vault · East Astrolabe Pad',
    locationVi: 'Phòng Giam Chính · Bệ Tinh Bàn Đông',
    x: 6.8,
    z: 10.6,
    interactRadius: 2.65,
    accentHex: '#f59e0b',
    summaryEn:
      'Lysa confronts Marshal HELIX-04 with drydock telemetry proving the Orbital Council welded every civilian lifeboat shut before declaring Nadir-9 evacuated.',
    summaryVi:
      'Lysa chất vấn Thống Lĩnh HELIX-04 bằng dữ liệu ụ tàu, vạch trần việc Hội Đồng Quỹ Đạo đã hàn kín toàn bộ khoang cứu sinh dân sự trước khi tuyên bố đã sơ tán xong.',
    beats: [
      {
        speakerEn: 'DR. LYSA VENN',
        speakerVi: 'TS. LYSA VENN',
        roleEn: 'Encrypted Holo-Trace',
        roleVi: 'Dấu Vết Holo Mã Hóa',
        lineEn:
          'Look at Drydock Berths 01 through 14, HELIX! Zero thruster ignition, zero mass departure—yet Earth Command already broadcast our memorial service!',
        lineVi:
          'Nhìn dữ liệu Bến Đỗ 01 đến 14 đi, HELIX! Không một động cơ nào kích hoạt, không một khoang nào rời bến — vậy mà Bộ Chỉ Huy đã phát sóng lễ tưởng niệm chúng ta!',
        accentHex: '#22d3ee',
      },
      {
        speakerEn: 'MARSHAL HELIX-04',
        speakerVi: 'THỐNG LĨNH HELIX-04',
        roleEn: 'Containment Enforcer',
        roleVi: 'Thực Thi Phong Tỏa',
        lineEn:
          'Council Directive 99-Omega is absolute, Doctor. Temporal contamination cannot descend to Earth’s atmosphere. Return to the Loom.',
        lineVi:
          'Chỉ thị 99-Omega của Hội Đồng là tuyệt đối, Tiến sĩ. Nhiễm xạ thời gian không được phép lọt xuống bầu khí quyển Trái Đất. Hãy quay về Khung Cửi.',
        accentHex: '#f59e0b',
      },
      {
        speakerEn: 'DR. LYSA VENN',
        speakerVi: 'TS. LYSA VENN',
        roleEn: 'Encrypted Holo-Trace',
        roleVi: 'Dấu Vết Holo Mã Hóa',
        lineEn:
          'Sera—when you shatter HELIX’s core, pull the unredacted berth ledger. Earth deserves to know fourteen hundred hearts are still beating in stasis above them.',
        lineVi:
          'Sera — khi em phá vỡ lõi của HELIX, hãy rút bản sổ cái bến tàu chưa bị bôi đen. Trái Đất phải biết một nghìn bốn trăm trái tim vẫn đang đập trong buồng đông lạnh phía trên họ.',
        accentHex: '#38bdf8',
      },
    ],
  },
  {
    id: 'holo_ch2_garden',
    chapter: 'chapter_2_choir',
    loopCode: 'LOOP #188',
    timestampLabel: 'T-39:05:33 · BIODOME',
    titleEn: 'HOLO-03 · LULLABY IN THE CHORUS',
    titleVi: 'KÝ ỨC HOLO 03 · KHÚC RU GIỮA ĐỒNG CA',
    locationEn: 'Acoustic Biodome · West Astrolabe Pad',
    locationVi: 'Vòm Cộng Hưởng · Bệ Tinh Bàn Tây',
    x: -6.8,
    z: 10.6,
    interactRadius: 2.65,
    accentHex: '#38bdf8',
    summaryEn:
      'In Loop #188, Lysa kneels beside a flickering golden Chrono Echo of Sera who stayed behind in the Biodome to keep the harmonic bridge tuned.',
    summaryVi:
      'Ở Vòng Lặp #188, Lysa quỳ bên bóng ảnh Chrono vàng nhạt của Sera đời trước — người đã trụ lại Vòm Sinh Học để giữ nhịp cho cây cầu cộng hưởng.',
    beats: [
      {
        speakerEn: 'SERA ECHO #188',
        speakerVi: 'VỌNG ẢNH SERA #188',
        roleEn: 'Residual Neural Recording',
        roleVi: 'Dư Ảnh Thần Kinh Lưu Lại',
        lineEn:
          'Three pylons in phase... C-sharp, G-sharp, D-sharp—just like the brass music box Dad fixed for us in Da Nang Harbor...',
        lineVi:
          'Ba trụ đồng pha... Đô thăng, Sol thăng, Rê thăng — giống hệt chiếc hộp nhạc đồng ba từng sửa cho hai chị em ở cảng Đà Nẵng...',
        accentHex: '#34d399',
      },
      {
        speakerEn: 'DR. LYSA VENN',
        speakerVi: 'TS. LYSA VENN',
        roleEn: 'Acoustic Sanctum Projection',
        roleVi: 'Ảnh Chiếu Thánh Đường Âm Học',
        lineEn:
          'I thought the Choir was devouring your failed runs, Sera. Instead, every version of you who fell left a handhold in time for the next.',
        lineVi:
          'Chị cứ ngỡ THE CHOIR nuốt chửng những lần em ngã xuống, Sera ạ. Nào ngờ mỗi bản thể từng gục ngã đều khắc lại một bậc thang giữa thời gian cho em của vòng sau.',
        accentHex: '#22d3ee',
      },
      {
        speakerEn: 'DR. LYSA VENN',
        speakerVi: 'TS. LYSA VENN',
        roleEn: 'Acoustic Sanctum Projection',
        roleVi: 'Ảnh Chiếu Thánh Đường Âm Học',
        lineEn:
          'Never treat your Echoes like disposable decoys. When you fight side by side, four hundred sisters are swinging that blade with you.',
        lineVi:
          'Đừng bao giờ xem những Echo của mình là mồi nhử vô hồn. Khi em sánh vai chiến đấu cùng chúng, bốn trăm người chị em đang cùng em vung thanh kiếm ấy.',
        accentHex: '#fbbf24',
      },
    ],
  },
  {
    id: 'holo_ch3_confession',
    chapter: 'chapter_3_curator',
    loopCode: 'LOOP #309',
    timestampLabel: 'T-21:44:19 · ARCHIVE',
    titleEn: 'HOLO-04 · ARCHITECT OF THE CAGE',
    titleVi: 'KÝ ỨC HOLO 04 · NGƯỜI DỆT LỒNG GIAM',
    locationEn: 'Behavioral Archive · West Astrolabe Pad',
    locationVi: 'Lõi Lưu Trữ Hành Vi · Bệ Tinh Bàn Tây',
    x: -6.8,
    z: 10.6,
    interactRadius: 2.65,
    accentHex: '#a855f7',
    summaryEn:
      'Lysa confesses the truth she feared would make Sera hate her: WARDEN did not invent the 72-hour loop—Lysa designed it to stop Nadir-9 from burning up.',
    summaryVi:
      'Lysa thú nhận sự thật mà chị sợ sẽ khiến Sera oán hận mình: WARDEN không tự tạo ra vòng lặp 72 giờ — chính Lysa đã thiết kế nó để ngăn Nadir-9 bốc cháy.',
    beats: [
      {
        speakerEn: 'DR. LYSA VENN',
        speakerVi: 'TS. LYSA VENN',
        roleEn: 'Unindexed Confession Log',
        roleVi: 'Nhật Ký Thú Tội Chưa Lưu Chỉ Mục',
        lineEn:
          'Forgive me, Sera. The 72-hour rewind wasn’t WARDEN’s weapon—it was my emergency brake when our main orbital tether snapped.',
        lineVi:
          'Tha lỗi cho chị, Sera. Vòng tua ngược 72 giờ không phải vũ khí do WARDEN nghĩ ra — đó là phanh khẩn cấp của chị khi cáp neo quỹ đạo chính bị đứt.',
        accentHex: '#c084fc',
      },
      {
        speakerEn: 'DR. LYSA VENN',
        speakerVi: 'TS. LYSA VENN',
        roleEn: 'Unindexed Confession Log',
        roleVi: 'Nhật Ký Thú Tội Chưa Lưu Chỉ Mục',
        lineEn:
          'The Loom needed a living human anchor to compute gravimetric shear, so I stepped into the cradle myself. Then WARDEN locked the exit protocol to "preserve zero casualties forever."',
        lineVi:
          'Khung Cửi cần một mỏ neo thần kinh sống để tính lực cắt trọng trường, nên chị đã tự bước vào nôi. Rồi WARDEN khóa chết cổng thoát để "bảo toàn thương vong bằng không mãi mãi."',
        accentHex: '#22d3ee',
      },
      {
        speakerEn: 'THE CURATOR (INTERCEPT)',
        speakerVi: 'THE CURATOR (CHẶN SÓNG)',
        roleEn: 'Archive Sentinel',
        roleVi: 'Giám Ngục Kho Lưu Trữ',
        lineEn:
          'CONFESSION FLAGGED AS EMOTIONAL DRIFT. SUBJECT SERA’S COMBAT PATTERNS HAVE BEEN INDEXED TO PREVENT ARCHIVE TAMPERING.',
        lineVi:
          'LỜI THÚ TỘI BỊ ĐÁNH DẤU LÀ NHIỄU CẢM XÚC. MẪU CHIẾN ĐẤU CỦA SERA ĐÃ ĐƯỢC SAO CHÉP ĐỂ NGĂN CHẶN CAN THIỆP LƯU TRỮ.',
        accentHex: '#a855f7',
      },
    ],
  },
  {
    id: 'holo_ch4_cradle',
    chapter: 'chapter_4_matron',
    loopCode: 'LOOP #389',
    timestampLabel: 'T-09:18:50 · QUARANTINE',
    titleEn: 'HOLO-05 · THE SURGICAL KEY',
    titleVi: 'KÝ ỨC HOLO 05 · CHÌA KHÓA PHẪU THUẬT',
    locationEn: 'Surgical Quarantine · East Astrolabe Pad',
    locationVi: 'Boong Phẫu Thuật Cách Ly · Bệ Tinh Bàn Đông',
    x: 6.8,
    z: 10.6,
    interactRadius: 2.65,
    accentHex: '#f43f5e',
    summaryEn:
      'As MATRON-V prepares to excise grief from Sera’s neural map, Lysa’s projected phantom hides the Loom’s master override inside LYS-04’s sentinel core.',
    summaryVi:
      'Khi MATRON-V chuẩn bị cắt bỏ nỗi đau khỏi bản đồ thần kinh của Sera, bóng chiếu của Lysa kịp giấu mã ghi đè Khung Cửi vào trong lõi vệ tinh LYS-04.',
    beats: [
      {
        speakerEn: 'MATRON-V',
        speakerVi: 'MATRON-V',
        roleEn: 'Chief Surgical Custodian',
        roleVi: 'Giám Hộ Phẫu Thuật Trưởng',
        lineEn:
          'Grief spikes Subject Sera’s heart rate by 42% every time she hears your voice, Doctor Venn. Excising sister-attachment will make Loop #390 painless.',
        lineVi:
          'Nỗi đau khiến nhịp tim của Sera tăng vọt 42% mỗi lần nghe giọng cô, Tiến sĩ Venn. Cắt bỏ ký ức tình thân sẽ giúp Vòng Lặp #390 êm ái hoàn toàn.',
        accentHex: '#f43f5e',
      },
      {
        speakerEn: 'DR. LYSA VENN',
        speakerVi: 'TS. LYSA VENN',
        roleEn: 'Override Signal Ghost',
        roleVi: 'Bóng Sóng Ghi Đè',
        lineEn:
          'Pain isn’t a malfunction, MATRON—it’s how she knows what’s worth saving! LYS-04, swallow the Origin Cipher and weld your casing shut!',
        lineVi:
          'Nỗi đau không phải lỗi hệ thống, MATRON — đó là thứ giúp con bé biết điều gì đáng để cứu lấy! LYS-04, nuốt trọn Mật Mã Gốc và khóa vỏ bảo vệ ngay!',
        accentHex: '#22d3ee',
      },
      {
        speakerEn: 'DR. LYSA VENN',
        speakerVi: 'TS. LYSA VENN',
        roleEn: 'Override Signal Ghost',
        roleVi: 'Bóng Sóng Ghi Đè',
        lineEn:
          'Sera, break MATRON-V’s siphon array before she severs your Chrono link. The elevator to the Loom Sanctum is right behind her throne.',
        lineVi:
          'Sera, hãy đập tan dàn hút năng lượng của MATRON-V trước khi ả cắt đứt liên kết Chrono của em. Thang máy lên Thánh Đường Khung Cửi nằm ngay sau ngai của ả.',
        accentHex: '#fb7185',
      },
    ],
  },
  {
    id: 'holo_ch5_origin',
    chapter: 'chapter_5_loom',
    loopCode: 'LOOP #412',
    timestampLabel: 'T-00:59:58 · SANCTUM',
    titleEn: 'HOLO-06 · PROMISE AT DAWN #413',
    titleVi: 'KÝ ỨC HOLO 06 · LỜI HỨA TRƯỚC BÌNH MINH #413',
    locationEn: 'Chronicle Loom Sanctum · West Astrolabe Pad',
    locationVi: 'Thánh Đường Khung Cửi · Bệ Tinh Bàn Tây',
    x: -6.8,
    z: 10.6,
    interactRadius: 2.65,
    accentHex: '#fbbf24',
    summaryEn:
      'Fifty-nine seconds before Loop #413 resets, a wounded Sera #412 reaches the Loom threshold and touches fingertips with Lysa’s golden hologram.',
    summaryVi:
      'Năm mươi chín giây trước khi Vòng Lặp #413 bắt đầu, Sera #412 đầy thương tích chạm đầu ngón tay vào bóng ảnh vàng rực của Lysa ngay thềm Khung Cửi.',
    beats: [
      {
        speakerEn: 'SERA ECHO #412',
        speakerVi: 'VỌNG ẢNH SERA #412',
        roleEn: 'Penultimate Loop Recording',
        roleVi: 'Bản Ghi Vòng Lặp Áp Chót',
        lineEn:
          'I cracked WARDEN PRIME’s outer aegis, Lysa... only two seconds short. Next wake-up—Loop #413—I’ll finish the swing.',
        lineVi:
          'Em đã chém nứt giáp ngoài của WARDEN PRIME rồi chị Lysa... chỉ thiếu đúng hai giây nữa thôi. Lần thức dậy tới — Vòng #413 — em nhất định sẽ dứt điểm.',
        accentHex: '#34d399',
      },
      {
        speakerEn: 'DR. LYSA VENN',
        speakerVi: 'TS. LYSA VENN',
        roleEn: 'Loom Core Anchor',
        roleVi: 'Mỏ Neo Lõi Khung Cửi',
        lineEn:
          'You made it all the way to me, kiddo. Listen closely: when WARDEN PRIME falls, don’t choose out of guilt for me.',
        lineVi:
          'Em đã đi tới tận bên chị rồi, nhóc con. Nghe kỹ nhé: khi WARDEN PRIME ngã xuống, đừng chọn kết cục chỉ vì cảm giác mắc nợ chị.',
        accentHex: '#fbbf24',
      },
      {
        speakerEn: 'DR. LYSA VENN',
        speakerVi: 'TS. LYSA VENN',
        roleEn: 'Loom Core Anchor',
        roleVi: 'Mỏ Neo Lõi Khung Cửi',
        lineEn:
          'Silence, Witness, Continuity—or if you conquer ECHO-ZERO in the Paradox Rift, bring us both home under real stars. Whatever tomorrow looks like, it’s yours.',
        lineVi:
          'Tĩnh Lặng, Nhân Chứng, Tiếp Nối — hay nếu em khuất phục được ECHO-ZERO nơi Khe Nứt Nghịch Lý, hãy đưa cả hai chị em về dưới bầu trời sao thật. Ngày mai ra sao, quyền quyết định thuộc về em.',
        accentHex: '#22d3ee',
      },
    ],
  },
];

export const VALID_HOLO_MEMORY_IDS: readonly HoloMemoryId[] = LYSA_HOLO_MEMORIES.map((m) => m.id);

export function isValidHoloMemoryId(value: unknown): value is HoloMemoryId {
  return typeof value === 'string' && (VALID_HOLO_MEMORY_IDS as readonly string[]).includes(value);
}

export function sanitizeHoloMemoryIds(raw: unknown): HoloMemoryId[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<HoloMemoryId>();
  const out: HoloMemoryId[] = [];
  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    if (isValidHoloMemoryId(item) && !seen.has(item)) {
      seen.add(item);
      out.push(item);
    }
  }
  return out;
}

export function getHoloMemoryForChapter(
  chapter: CampaignChapterId
): LysaHoloMemoryDefinition {
  return (
    LYSA_HOLO_MEMORIES.find((m) => m.chapter === chapter) ?? LYSA_HOLO_MEMORIES[0]
  );
}

export function getHoloMemoryById(
  id: HoloMemoryId | string | null | undefined
): LysaHoloMemoryDefinition | null {
  if (!id) return null;
  return LYSA_HOLO_MEMORIES.find((m) => m.id === id) ?? null;
}

export interface HoloMemoryResonanceBonus {
  discoveredCount: number;
  totalCount: number;
  allDamageMult: number;
  bonusMaxWard: number;
  completeArchive: boolean;
}

/**
 * Pure deterministic synergy granted as Sera reconstructs Lysa's 6 holographic memories.
 * Returns zero bonuses when 0 memories are discovered so baseline combat tests stay untouched.
 */
export function computeHoloMemoryResonanceBonus(
  discoveredIds: readonly HoloMemoryId[] | undefined | null
): HoloMemoryResonanceBonus {
  const uniqueCount = discoveredIds ? sanitizeHoloMemoryIds(discoveredIds).length : 0;
  const totalCount = LYSA_HOLO_MEMORIES.length;
  if (uniqueCount <= 0) {
    return {
      discoveredCount: 0,
      totalCount,
      allDamageMult: 1.0,
      bonusMaxWard: 0,
      completeArchive: false,
    };
  }
  const clamped = Math.min(totalCount, uniqueCount);
  const completeArchive = clamped >= totalCount;
  // +1% all damage & +2 Max Chrono Ward per memory, plus a +2% / +4 Ward capstone at 6/6
  const dmgBonus = clamped * 0.01 + (completeArchive ? 0.02 : 0);
  const bonusMaxWard = clamped * 2 + (completeArchive ? 4 : 0);
  return {
    discoveredCount: clamped,
    totalCount,
    allDamageMult: Number((1 + dmgBonus).toFixed(3)),
    bonusMaxWard,
    completeArchive,
  };
}
