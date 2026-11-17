(function (KB) {
  "use strict";
  KB.GameTimer = class GameTimer {
    constructor(onTick, onEnd) { this.onTick = onTick; this.onEnd = onEnd; this.remaining = 0; this.interval = null; this.paused = false; this.last = 0; }
    start(seconds) {
      this.stop(); this.paused = false; this.remaining = seconds;
      if (seconds === Infinity) { this.onTick(Infinity); return; }
      this.last = Date.now(); this.onTick(seconds);
      this.interval = setInterval(() => {
        if (this.paused) return;
        const now = Date.now();
        this.remaining -= (now - this.last) / 1000; this.last = now;
        this.onTick(Math.max(0, this.remaining));
        if (this.remaining <= 0) { this.stop(); this.onEnd(); }
      }, 50);
    }
    pause() { this.paused = true; }
    resume() { this.last = Date.now(); this.paused = false; }
    stop() { if (this.interval) clearInterval(this.interval); this.interval = null; }
  };
})(window.KB = window.KB || {});
