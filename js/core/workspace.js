/** Shared pointer/click handling for the visible workspace rectangle. */
export function createWorkspace(root, content, { onMove = () => {}, onLeave = () => {}, onClick = () => {} } = {}) {
  root.innerHTML = `<section class="workspace" aria-label="鍵操作用ウォークスペース">
    <div class="workspace-heading"><span>WORKSPACE</span><small>この枠内で操作</small></div>
    <div class="workspace-stage">${content}</div>
  </section>`;
  const workspace = root.querySelector('.workspace');
  const containsPoint = (clientX, clientY) => {
    const rect = workspace.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
  };
  workspace.addEventListener('pointermove', event => {
    if (containsPoint(event.clientX, event.clientY)) onMove(event, workspace);
  });
  workspace.addEventListener('pointerleave', event => onLeave(event));
  workspace.addEventListener('click', event => {
    if (containsPoint(event.clientX, event.clientY)) onClick(event, workspace);
  });
  return { workspace, containsPoint };
}
