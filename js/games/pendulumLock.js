import { createWorkspace } from '../core/workspace.js';

const wrapAngle = value => ((value % 360) + 360) % 360;
const angleDistance = (a, b) => Math.abs((((a - b) + 540) % 360) - 180);\nconst isInsideZone = (needle, center, width) => angleDistance(wrapAngle(needle), wrapAngle(center)) <= width / 2;

// Sample a value inside [min, max], at least minChange away from previous.
function randomDifferent(previous, min, max, minChange) {
  const ranges = [
    [min, Math.min(max, previous - minChange)],
    [Math.max(min, previous + minChange), max]
  ].filter(([a, b]) => b - a > 1e-9);
  if (!ranges.length) return previous;
  const lengths = ranges.map(([a, b]) => b - a);
  let pick = Math.random() * lengths.reduce((sum, n) => sum + n, 0);
  for (let i = 0; i < ranges.length; i++) {
    if (pick <= lengths[i]) return ranges[i][0] + pick;
    pick -= lengths[i];
  }
  return ranges[ranges.length - 1][1];
}

export function mountPendulum(root, ctx) {
  let progress = 0;
  let done = false;
  let phase = Math.asin(0); // Start at the center and move toward one end.
  let currentAmplitude = ctx.config.amplitude;
  let targetAmplitude = currentAmplitude;
  let currentSpeed = ctx.config.needleSpeed;
  let targetSpeed = currentSpeed;
  let zoneCenter = ctx.config.zoneStart;
  let last = performance.now();
  let raf = 0;
  const amplitudeMin = ctx.config.amplitudeMin;
  const amplitudeMax = ctx.config.amplitudeMax;

  const content = `<div class="game-widget pendulum-widget">
    <div class="meter" id="pendulumMeter"><div class="meter-zone" id="meterZone"></div><div class="meter-needle" id="needle"></div><div class="meter-center"></div></div>
    <p>色の付いた範囲に針が入った瞬間にクリック。</p>
    <div class="progress-track"><div class="progress-fill" id="unlockProgress"></div></div>
    <small id="unlockText">解除度 0%</small>
  </div>`;

  const workspaceApi = createWorkspace(root, content, {
    onClick() {
      if (done || ctx.isPaused?.()) return;
      const needleAngle = wrapAngle(currentAmplitude * Math.sin(phase));
      const effectiveWidth = ctx.config.zoneWidth + 2 * (ctx.config.zoneInputTolerance || 0);
      if (isInsideZone(needleAngle, zoneCenter, effectiveWidth)) {
        const diff = angleDistance(needleAngle, zoneCenter);
        progress = Math.min(100, progress + ctx.config.gain + (diff < ctx.config.zoneWidth * ctx.config.centerBonusRatio ? ctx.config.centerBonus : 0));
        if (progress >= 100) {
          done = true;
          ctx.onSuccess(100);
          return;
        }
        // Each success independently randomizes speed, sweep amplitude and target position.
        // The new target is constrained to the sweep's reachable area.
        targetSpeed = randomDifferent(
          targetSpeed, ctx.config.speedMin, ctx.config.speedMax, ctx.config.speedMinChange
        );
        targetAmplitude = randomDifferent(
          targetAmplitude, amplitudeMin, amplitudeMax, ctx.config.amplitudeMinChange
        );
        const reachableAmplitude = Math.min(currentAmplitude, targetAmplitude);
        const maxCenter = Math.max(0, reachableAmplitude - effectiveWidth / 2 - ctx.config.zoneReachMargin);
        zoneCenter = randomDifferent(
          zoneCenter, -maxCenter, maxCenter, Math.min(ctx.config.zoneMinChange, maxCenter)
        );
        renderZone();
      } else {
        progress = Math.max(0, progress - ctx.config.missLoss);
      }
      root.querySelector('#unlockProgress').style.width = `${progress}%`;
      root.querySelector('#unlockText').textContent = `解除度 ${Math.round(progress)}%`;
    }
  });

  const frame = now => {
    if (done) return;
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    if (!ctx.isPaused?.()) {
      currentSpeed += (targetSpeed - currentSpeed) * Math.min(1, dt * ctx.config.changeSmoothing);
      currentAmplitude += (targetAmplitude - currentAmplitude) * Math.min(1, dt * ctx.config.changeSmoothing);
      phase += currentSpeed * dt;
    }
    const angle = currentAmplitude * Math.sin(phase);
    root.querySelector('#needle').style.transform = `translate(-50%,-100%) rotate(${angle}deg)`;
    raf = requestAnimationFrame(frame);
  };
  function renderZone() {
    const zone = root.querySelector('#meterZone');
    const width = ctx.config.zoneWidth + 2 * (ctx.config.zoneInputTolerance || 0);
    zone.style.setProperty('--zone-start', `${wrapAngle(zoneCenter - width / 2)}deg`);
    zone.style.setProperty('--zone-width', `${width}deg`);
  }
  renderZone();
  raf = requestAnimationFrame(frame);
  return () => {
    done = true;
    cancelAnimationFrame(raf);
    workspaceApi.destroy();
  };
}
