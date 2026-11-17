/** ピッキング: WORKSPACE内のカーソル位置でバー角度を決め、正解角度でクリックして3段階解錠する。 */
(function (KB) {
  "use strict";
  const wrap360 = v => ((v % 360) + 360) % 360;
  // 0/360度をまたぐ場合も最短の角度差(0〜180)を返す
  const angleDistance = (a, b) => Math.abs(((wrap360(a) - wrap360(b) + 540) % 360) - 180);
  // 直前の正解角度から必ず minSep 度以上(最短角度差)離れた正解角度列を作る
  function generateTargets(count, minSep, rng) {
    rng = rng || Math.random;
    const list = [rng() * 360];
    for (let i = 1; i < count; i++) list.push(wrap360(list[i - 1] + minSep + rng() * (360 - 2 * minSep)));
    return list;
  }
  KB.pickingUtils = { angleDistance: angleDistance, generateTargets: generateTargets, wrap360: wrap360 };

  KB.mountPicking = function (root, ctx) {
    const cfg = ctx.config;
    const stages = cfg.stages;
    const tol = Math.max(4, cfg.angleTolerance / (1 + (cfg.difficulty - 1) * .6));
    const targets = generateTargets(stages, cfg.targetMinSeparation);
    let angle = 0, step = 0, clicks = 0, danger = 0, done = false, inside = false;
    let lastTime = performance.now(), acc = 0;

    const content = '<div class="game-widget picking-widget">' +
      '<div class="lock-visual" id="lockVisual"><div class="pick-bar" id="pickBar"></div></div>' +
      '<div class="danger-label">DANGER</div>' +
      '<div class="danger-track"><div class="danger-fill" id="dangerFill"></div></div>' +
      '<div class="progress-track"><div class="progress-fill" id="pickProgress"></div></div>' +
      '<small id="pickStep"></small></div>';
    const ws = KB.createWorkspace(root, content, {
      onMove(e) { if (!done && !ctx.isPaused()) { setAngleFrom(e); inside = true; render(); } },
      onLeave() { inside = false; render(); },
      onClick(e) {
        if (done || ctx.isPaused()) return;
        setAngleFrom(e);
        const hit = angleDistance(angle, targets[step]) <= tol;
        if (hit) {
          clicks++; danger += cfg.dangerRise;
          if (clicks >= cfg.clicksPerStage) { step++; clicks = 0; }
        } else danger += cfg.dangerMissRise;
        danger = Math.min(cfg.dangerLimit, danger);
        if (step >= stages) { done = true; render(); ctx.onSuccess(); return; }
        // フリーモードでは危険ゲージが満タンになっても失敗にしない
        if (danger >= cfg.dangerLimit && cfg.mode !== "FR") { done = true; render(); ctx.onFail("危険ゲージが最大になった"); return; }
        render();
      }
    });
    const $ = id => root.querySelector("#" + id);
    const lock = $("lockVisual"), bar = $("pickBar");

    function setAngleFrom(e) {
      const r = lock.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      if (Math.hypot(dx, dy) < 6) return; // 中心付近は角度が不安定なので更新しない
      angle = wrap360(Math.atan2(dx, -dy) * 180 / Math.PI);
    }
    function render() {
      const diff = angleDistance(angle, targets[step >= stages ? stages - 1 : step]);
      const good = diff <= tol;
      // 正解角度に近づくほど オレンジ(30) → シアン(170) へ連続的に変化
      const t = Math.max(0, Math.min(1, 1 - (diff - tol) / (cfg.nearTolerance * 2 - tol)));
      bar.style.background = "hsl(" + Math.round(30 + 140 * t) + " 90% 62%)";
      bar.classList.toggle("good", good);
      bar.style.transform = "translate(-50%,-100%) rotate(" + angle + "deg)";
      $("dangerFill").style.width = (danger / cfg.dangerLimit * 100) + "%";
      $("dangerFill").classList.toggle("hot", danger / cfg.dangerLimit >= .7);
      $("pickProgress").style.width = ((step * cfg.clicksPerStage + clicks) / (stages * cfg.clicksPerStage) * 100) + "%";
      $("pickStep").textContent = "段階 " + Math.min(step + 1, stages) + " / " + stages + " ・ " + clicks + " / " + cfg.clicksPerStage;
      ws.workspace.classList.toggle("is-active", inside);
    }

    // 危険ゲージの固定間隔ティック。経過時間(performance.now)から実行すべきティック数を求めるため、
    // setIntervalの遅延・処理落ち・タブ非アクティブでも減少量は実時間に比例する(描画FPSとは独立)。
    function tick() { danger = Math.max(0, danger - cfg.dangerDecayPerTick); }
    function pump() {
      const now = performance.now();
      if (done) return;
      if (ctx.isPaused()) { lastTime = now; return; } // 一時停止中は進めない・再開時に追いつかない
      acc += now - lastTime; lastTime = now;
      let n = Math.floor(acc / cfg.tickIntervalMs);
      acc -= n * cfg.tickIntervalMs;
      n = Math.min(n, cfg.maxCatchUpTicks);
      for (let i = 0; i < n; i++) tick();
      if (n > 0) render();
    }
    const timerId = setInterval(pump, cfg.tickIntervalMs);
    render();
    return function () { clearInterval(timerId); done = true; };
  };
})(window.KB = window.KB || {});
