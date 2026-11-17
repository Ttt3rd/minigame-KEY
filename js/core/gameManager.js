(function (KB) {
  "use strict";
  KB.GameManager = class GameManager {
    constructor(app) {
      this.app = app;
      this.timer = new KB.GameTimer(t => app.setTime(t), () => this.timeUp());
      this.cleanup = null; this.session = null; this.paused = false;
    }
    startSingle(game, mode) { this.session = KB.createSingleSession(game, mode); this.startRound(); }
    startRandom(games, mode) { this.session = KB.createRandomSession(games, mode); KB.chooseNext(this.session); this.startRound(); }
    startRound() {
      const s = this.session, g = KB.GAME_CONFIG[s.game], p = KB.gameParams(g, s.mode, s.stage, s.adaptive);
      if (this.cleanup) this.cleanup();
      this.paused = false;
      document.getElementById("screen-pause").classList.remove("active");
      this.app.updateHud(s); this.app.setGameInfo(g.name, s.game);
      KB.showScreen("game");
      const mount = document.getElementById("game-mount");
      const ctx = {
        config: Object.assign({}, g, p, { mode: s.mode }),
        isPaused: () => this.paused,
        onSuccess: () => this.end(true),
        onFail: reason => this.end(false, reason)
      };
      this.cleanup = s.game === "picking" ? KB.mountPicking(mount, ctx) : KB.mountPendulum(mount, ctx);
      if (s.mode === "FR") this.timer.start(Infinity);
      else if (s.mode === "LT") this.timer.start(p.time);
      else if (s.plays === 0) this.timer.start(KB.MODE_CONFIG.TA.duration);
    }
    timeUp() {
      if (!this.session) return;
      if (this.session.mode === "TA") this.finish(true, "タイムアップ");
      else this.end(false, "時間切れ");
    }
    end(success, reason) {
      if (!this.session) return;
      reason = reason || "";
      const s = this.session;
      if (s.mode !== "TA") this.timer.stop();
      if (this.cleanup) this.cleanup();
      this.cleanup = null; s.plays++;
      if (success) { s.successes++; s.score += Math.round(100 * (s.mode === "TA" ? s.adaptive : 1)); }
      if (s.mode === "TA") {
        // Adaptive: 緩やかに調整(成功+0.035 / 失敗-0.045、範囲0.72〜1.45)
        s.adaptive = Math.max(.72, Math.min(1.45, s.adaptive + (success ? .035 : -.045)));
        if (this.timer.remaining <= 0) { this.finish(true, "タイムアップ"); return; }
        if (s.type === "random") KB.chooseNext(s);
        this.startRound(); return;
      }
      if (s.mode === "FR") {
        if (s.type === "random") { this.app.showChoice(s); return; }
        this.finish(success, reason); return;
      }
      if (!success) { this.finish(false, reason); return; }
      s.stage++;
      if (s.type === "random") { this.app.showChoice(s); return; }
      this.startRound();
    }
    continueRandom(game) { if (!this.session) return; KB.chooseNext(this.session, game); this.startRound(); }
    finish(success, reason) {
      this.timer.stop(); if (this.cleanup) this.cleanup(); this.cleanup = null;
      const s = this.session; s.success = success; this.session = null;
      this.app.finishSession(s, success, reason || "");
    }
    pause() { if (!this.session) return; this.timer.pause(); this.paused = true; document.getElementById("screen-pause").classList.add("active"); }
    resume() { this.timer.resume(); this.paused = false; document.getElementById("screen-pause").classList.remove("active"); }
    stop() {
      this.timer.stop(); if (this.cleanup) this.cleanup(); this.cleanup = null; this.session = null; this.paused = false;
      document.getElementById("screen-pause").classList.remove("active");
    }
  };
})(window.KB = window.KB || {});
