/** WORKSPACE: 鍵操作を受け付ける領域。実際の表示矩形(getBoundingClientRect)を基準に内外を判定する。 */
(function (KB) {
  "use strict";
  KB.createWorkspace = function (root, content, handlers) {
    const h = Object.assign({ onMove() {}, onLeave() {}, onClick() {} }, handlers || {});
    root.innerHTML = '<section class="workspace" aria-label="鍵操作用ウォークスペース">' +
      '<div class="workspace-heading"><span>WORKSPACE</span><small>この枠内で操作</small></div>' +
      '<div class="workspace-stage">' + content + '</div></section>';
    const workspace = root.querySelector(".workspace");
    const containsPoint = (x, y) => {
      const r = workspace.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    };
    // pointerdown でも位置を更新する(タッチ操作では move が発生しないため)
    const move = e => { if (containsPoint(e.clientX, e.clientY)) h.onMove(e, workspace); };
    workspace.addEventListener("pointermove", move);
    workspace.addEventListener("pointerdown", move);
    workspace.addEventListener("pointerleave", e => h.onLeave(e));
    workspace.addEventListener("click", e => { if (containsPoint(e.clientX, e.clientY)) h.onClick(e, workspace); });
    return { workspace: workspace, containsPoint: containsPoint };
  };
})(window.KB = window.KB || {});
