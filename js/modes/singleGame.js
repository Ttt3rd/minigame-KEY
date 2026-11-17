(function (KB) {
  "use strict";
  KB.createSingleSession = function (game, mode) {
    return { type: "single", game: game, games: [game], mode: mode, stage: 1, score: 0, plays: 0, successes: 0, adaptive: 1 };
  };
})(window.KB = window.KB || {});
