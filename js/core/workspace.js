/** Shared pointer handling constrained to the visible WORKSPACE rectangle. */
export function createWorkspace(root, content, { onMove = () => {}, onLeave = () => {}, onClick = () => {} } = {}) {
  root.innerHTML = `<section class="workspace" aria-label="鍵操作用ウォークスペース" tabindex="0">
    <div class="workspace-heading"><span>WORKSPACE</span><small>この枠内で操作</small></div>
    <div class="workspace-stage">${content}</div>
  </section>`;
  const workspace = root.querySelector('.workspace');
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const containsPoint = (x, y) => {
    const r = workspace.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  };
  workspace.addEventListener('pointermove', e => containsPoint(e.clientX,e.clientY) ? onMove(e,workspace) : onLeave(e,workspace), options);
  workspace.addEventListener('pointerleave', e => onLeave(e,workspace), options);
  workspace.addEventListener('pointerdown', e => {
    if (!containsPoint(e.clientX,e.clientY)) return;
    if (e.pointerType === 'touch') e.preventDefault();
    onClick(e,workspace);
  }, options);
  return { workspace, containsPoint, destroy: () => controller.abort() };
}
