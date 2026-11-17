/* アプリ全体の初期化・ボタンイベント登録。必ず最後に読み込む。 */
(function (KB) {
  "use strict";
  const $ = id => document.getElementById(id);
  const data = KB.loadData();
  let selectedGame = "picking", selectedMode = "LT", randomMode = false, randomGames = ["picking", "pendulum"];

  const INSTRUCTIONS = {
    picking: "WORKSPACE内でカーソルを動かしてバーの角度を合わせ、正解角度でクリックを繰り返そう。",
    pendulum: "WORKSPACE内で、色の付いた範囲に針が入った瞬間にクリック！"
  };
  const app = {
    setTime(t) { $("hud-time").textContent = t === Infinity ? "∞" : Math.ceil(t) + "s"; },
    updateHud(s) { $("hud-mode").textContent = s.mode; $("hud-stage").textContent = String(s.stage).padStart(2, "0"); $("hud-score").textContent = s.score; },
    setGameInfo(name, id) {
      $("game-name").textContent = name;
      $("game-kicker").textContent = "LOCK CHALLENGE / " + id.toUpperCase();
      $("game-instruction").textContent = INSTRUCTIONS[id] || "";
      $("game-status").textContent = "IN PROGRESS"; $("game-progress").textContent = "";
    },
    showChoice(s) { $("hud-stage").textContent = String(s.stage).padStart(2, "0"); $("hud-score").textContent = s.score; KB.showScreen("choice"); },
    finishSession(s, success, reason) {
      KB.recordSession(data, s);
      $("result-title").textContent = success ? "SESSION COMPLETE" : "GAME OVER";
      $("result-score").textContent = s.score;
      $("result-details").innerHTML =
        '<div class="record-card"><span>モード</span><b>' + s.mode + '</b></div>' +
        '<div class="record-card"><span>到達ステージ</span><b>' + s.stage + '</b></div>' +
        '<div class="record-card"><span>成功回数</span><b>' + s.successes + '</b></div>' +
        '<div class="record-card"><span>結果</span><b>' + (reason || (success ? "解錠成功" : "失敗")) + '</b></div>';
      KB.showScreen("result");
    }
  };
  const manager = new KB.GameManager(app);
  KB.debug = { manager: manager };

  function beginMode(mode) {
    selectedMode = mode;
    if (randomMode) {
      randomGames = [...document.querySelectorAll("#screen-random-filter input:checked")].map(x => x.value);
      if (!randomGames.length) { alert("ゲームを1つ以上選択してください。"); return; }
      manager.startRandom(randomGames, mode);
    } else manager.startSingle(selectedGame, mode);
  }
  function renderRecords() {
    const r = data.records;
    const card = (l, v) => '<div class="record-card"><span>' + l + '</span><b>' + v + '</b></div>';
    $("records-content").innerHTML = card("LT 最高到達ステージ", r.LT.bestStage) + card("LT クリア回数", r.LT.clears) +
      card("TA ハイスコア", r.TA.bestScore) + card("TA プレイ回数", r.TA.plays) + card("FR プレイ回数", r.FR.plays) + card("FR 成功回数", r.FR.clears);
  }

  document.querySelectorAll("button[data-action]").forEach(button => {
    button.addEventListener("click", () => {
      switch (button.dataset.action) {
        case "home": manager.stop(); KB.showScreen("home"); break;
        case "single": randomMode = false; KB.showScreen("game-select"); break;
        case "random": randomMode = true; KB.showScreen("random-filter"); break;
        case "records": renderRecords(); KB.showScreen("records"); break;
        case "settings": KB.showScreen("settings"); break;
        case "to-mode": KB.showScreen("mode-select"); break;
        case "back-select": KB.showScreen(randomMode ? "random-filter" : "game-select"); break;
        case "random-to-mode": KB.showScreen("mode-select"); break;
        default: console.error("[KEY//BREAK] Unknown action: " + button.dataset.action);
      }
    });
  });
  document.querySelectorAll("button[data-game]").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll("button[data-game]").forEach(i => i.classList.remove("selected"));
      button.classList.add("selected"); selectedGame = button.dataset.game;
    });
  });
  document.querySelectorAll("button[data-mode]").forEach(b => b.addEventListener("click", () => beginMode(b.dataset.mode)));
  document.querySelectorAll("button[data-next-game]").forEach(b => b.addEventListener("click", () => manager.continueRandom(b.dataset.nextGame)));
  $("pauseBtn").addEventListener("click", () => manager.pause());
  $("resumeBtn").addEventListener("click", () => manager.resume());
  $("quitBtn").addEventListener("click", () => { manager.stop(); KB.showScreen("home"); });
  $("retryBtn").addEventListener("click", () => { if (randomMode) manager.startRandom(randomGames, selectedMode); else manager.startSingle(selectedGame, selectedMode); });
  $("clearRecords").addEventListener("click", () => { if (confirm("すべての記録を消去しますか？")) { try { localStorage.removeItem("keybreak-alpha1"); } catch (e) {} location.reload(); } });
  $("soundToggle").checked = data.settings.sound; $("shakeToggle").checked = data.settings.shake;
  ["soundToggle", "shakeToggle"].forEach((id, i) => $(id).addEventListener("change", () => { data.settings[i ? "shake" : "sound"] = $(id).checked; KB.saveData(data); }));
  $("brandHome").addEventListener("click", e => { e.preventDefault(); manager.stop(); KB.showScreen("home"); });
  KB.booted = true;
})(window.KB = window.KB || {});
