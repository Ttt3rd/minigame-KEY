(function (KB) {
  "use strict";
  KB.stageScale = function (stage) { return 1 + Math.min(1.2, Math.max(0, stage - 1) * 0.055); };
  KB.adjustedDifficulty = function (ratio) { return Math.max(.72, Math.min(1.45, 1 + (ratio - .55) * .45)); };
  KB.gameParams = function (game, mode, stage, adaptive) {
    if (adaptive === undefined) adaptive = 1;
    var scale = KB.stageScale(stage);
    return {
      time: mode === "LT" ? Math.max(game.timeFloor, game.baseTime / scale) : game.baseTime,
      difficulty: mode === "TA" ? adaptive : scale
    };
  };
})(window.KB = window.KB || {});
