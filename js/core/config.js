export const GAME_CONFIG = {
  picking: { id:"picking", name:"ピッキング", baseTime:35, timeFloor:12, dangerRise:8, dangerDecay:3, dangerLimit:100, angleTolerance:9, clicksPerStage:5 },
  pendulum: { id:"pendulum", name:"振り子ロック", baseTime:30, timeFloor:12, needleSpeed:1.9, zoneWidth:34, gain:25, missLoss:8, centerBonus:12 }
};
export const MODE_CONFIG = { LT:{}, TA:{duration:90}, FR:{} };
export const RANDOM_CANDIDATES = 2;
