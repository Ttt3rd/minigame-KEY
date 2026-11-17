(function (KB) {
  "use strict";
  const KEY = "keybreak-alpha1";
  const makeDefaults = () => ({ records: { LT: { bestStage: 0, clears: 0 }, TA: { bestScore: 0, plays: 0 }, FR: { plays: 0, clears: 0 } }, settings: { sound: true, shake: true } });
  KB.loadData = function () {
    const d = makeDefaults();
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
      if (saved.records) for (const m of Object.keys(d.records)) Object.assign(d.records[m], saved.records[m] || {});
      if (saved.settings) Object.assign(d.settings, saved.settings);
    } catch (e) { console.warn("[KEY//BREAK] LocalStorage unavailable or corrupted; using defaults.", e); }
    return d;
  };
  KB.saveData = function (data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { console.warn("[KEY//BREAK] save failed", e); }
  };
  KB.recordSession = function (data, session) {
    const r = data.records;
    if (session.mode === "LT") { r.LT.bestStage = Math.max(r.LT.bestStage, session.stage); if (session.success) r.LT.clears++; }
    if (session.mode === "TA") { r.TA.bestScore = Math.max(r.TA.bestScore, session.score); r.TA.plays++; }
    if (session.mode === "FR") { r.FR.plays++; if (session.success) r.FR.clears++; }
    KB.saveData(data);
  };
})(window.KB = window.KB || {});
