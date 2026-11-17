/* ゲーム設定値。クラシックスクリプト方式（file:// と HTTP の両方で動作させるため）。 */
(function (KB) {
  "use strict";
  KB.GAME_CONFIG = {
    picking: {
      id: "picking", name: "ピッキング", baseTime: 35, timeFloor: 12,
      // 危険ゲージ: 0〜dangerLimit。クリックで増加、tickIntervalMsごとのティックで減少。
      dangerLimit: 100,
      dangerRise: 5,            // 正解角度でクリックした時の増加量
      dangerMissRise: 8,        // 角度が外れている時にクリックした時の増加量
      dangerDecayPerTick: 0.35, // 1ティックあたりの減少量
      tickIntervalMs: 50,       // 固定ティック間隔(描画FPSとは独立)
      maxCatchUpTicks: 400,     // 処理落ち・タブ非アクティブ後に追いつく最大ティック数
      angleTolerance: 9, nearTolerance: 30,
      clicksPerStage: 5, stages: 3,
      targetMinSeparation: 45   // 直前の正解角度との最小角度差(度)
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
  KB.MODE_CONFIG = { LT: {}, TA: { duration: 90 }, FR: {} };
  KB.RANDOM_CANDIDATES = 2;
})(window.KB = window.KB || {});
