(function (KB) {
  "use strict";
  KB.createRandomSession = function (games, mode) {
    return { type: "random", game: null, games: [...games], mode: mode, stage: 1, score: 0, plays: 0, successes: 0, adaptive: 1, lastGame: null };
  };
  // 前回と同じゲームは避ける。選択可能なゲームが1種類のみの場合は例外。
  KB.chooseNext = function (session, preferred) {
    let choices = session.games.filter(g => g !== session.lastGame);
    if (!choices.length) choices = session.games;
    const game = preferred && choices.includes(preferred) ? preferred : choices[Math.floor(Math.random() * choices.length)];
    session.lastGame = game; session.game = game;
    return game;
  };
})(window.KB = window.KB || {});
