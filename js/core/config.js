export const GAME_CONFIG = {
  picking: {
    id: "picking", name: "ピッキング", baseTime: 35, timeFloor: 12,
    dangerRise: 8, dangerDecayPerTick: 2.4, tickIntervalMs: 50,
    dangerLimit: 100, angleTolerance: 9, clicksPerStage: 5,
    targetMinSeparation: 45, missMultiplier: 1.4
  },
  pendulum: {
    id: "pendulum", name: "振り子ロック", baseTime: 30, timeFloor: 12,
    needleSpeed: 1.9, speedMin: 1.1, speedMax: 3.1, speedMinChange: 0.25,
    amplitude: 125, amplitudeMin: 95, amplitudeMax: 140, amplitudeMinChange: 8,
    zoneStart: -35, zoneWidth: 34, zoneMinChange: 35, zoneReachMargin: 5,
    zoneTransitionMs: 260, changeSmoothing: 2.8,
    gain: 25, missLoss: 8, centerBonus: 12, centerBonusRatio: 0.18
  }
};
export const MODE_CONFIG = { LT: {}, TA: { duration: 90 }, FR: {} };
export const RANDOM_CANDIDATES = 2;
