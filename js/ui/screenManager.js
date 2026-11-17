(function (KB) {
  "use strict";
  KB.showScreen = function (name) {
    const target = document.getElementById("screen-" + name);
    if (!target) { console.error("[KEY//BREAK] Screen not found: screen-" + name); return false; }
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    target.classList.add("active");
    return true;
  };
})(window.KB = window.KB || {});
