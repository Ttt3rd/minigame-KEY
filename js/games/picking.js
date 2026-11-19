import { createWorkspace } from '../core/workspace.js';

const angleDistance = (a,b) => Math.abs((((a-b)+540)%360)-180);

function createTargets(config) {
  const min=config.targetMin ?? -150, max=config.targetMax ?? 150;
  const separation=config.targetMinSeparation, limit=config.targetResampleLimit ?? 120;
  const result=[];
  for(let i=0;i<3;i++){
    const previous=result[i-1];
    let candidate;
    for(let n=0;n<limit;n++){
      const value=min+Math.random()*(max-min);
      if(previous===undefined || angleDistance(value,previous)>=separation){candidate=value;break;}
    }
    if(candidate===undefined){
      // Bounded fallback: choose the candidate with the greatest distance from the previous target.
      let best=min, bestDistance=-1;
      for(let n=0;n<=720;n++){
        const value=min+(max-min)*n/720;
        const distance=previous===undefined?Infinity:angleDistance(value,previous);
        if(distance>bestDistance){best=value;bestDistance=distance;}
      }
      candidate=best;
    }
    result.push(candidate);
  }
  return result;
}

export function mountPicking(root,ctx) {
  let angle=0,stage=0,clicks=0,danger=0,done=false,lastUpdate=performance.now();
  const cfg=ctx.config, targets=createTargets(cfg);
  const content=`<div class="game-widget picking-widget">
    <div class="lock-visual" id="pickVisual"><div class="pick-bar" id="pickBar"></div></div>
    <p>WORKSPACE内でカーソルを動かして角度を調整し、正解位置でクリック。</p>
    <div class="danger-track" role="meter" aria-label="危険ゲージ" aria-valuemin="0" aria-valuemax="100"><div class="danger-fill" id="dangerFill"></div></div>
    <small>危険ゲージ</small>
    <div class="progress-track"><div class="progress-fill" id="pickProgress"></div></div>
    <small id="pickStep">段階 1 / 3 ・ 0 / ${cfg.clicksPerStage}</small>
  </div>`;
  const $=id=>root.querySelector(`#${id}`);
  const render=()=>{
    $('pickBar').style.transform=`translate(-50%,-100%) rotate(${angle}deg)`;
    $('pickBar').classList.toggle('good',angleDistance(angle,targets[stage])<=cfg.angleTolerance);
    $('dangerFill').style.width=`${Math.max(0,Math.min(100,danger))}%`;
    $('dangerFill').parentElement.setAttribute('aria-valuenow',String(Math.round(danger)));
    $('pickProgress').style.width=`${((stage*cfg.clicksPerStage+clicks)/(3*cfg.clicksPerStage))*100}%`;
    $('pickStep').textContent=`段階 ${stage+1} / 3 ・ ${clicks} / ${cfg.clicksPerStage}`;
  };
  const failIfFull=()=>{if(!done&&danger>=cfg.dangerLimit){done=true;ctx.onFail('危険ゲージが最大になった');}};
  const api=createWorkspace(root,content,{
    onMove(e){
      if(done||ctx.isPaused?.())return;
      const r=$('pickVisual').getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);
      if(Math.hypot(dx,dy)<3)return;
      angle=Math.atan2(dx,-dy)*180/Math.PI;render();
    },
    onClick(){
      if(done||ctx.isPaused?.())return;
      if(angleDistance(angle,targets[stage])<=cfg.angleTolerance){
        clicks++;danger=Math.min(cfg.dangerLimit,danger+cfg.dangerRise);
        if(danger>=cfg.dangerLimit){done=true;render();ctx.onFail('危険ゲージが最大になった');return;}
        if(clicks>=cfg.clicksPerStage){stage++;clicks=0;if(stage>=3){done=true;ctx.onSuccess(100);return;}}
      }else danger=Math.min(cfg.dangerLimit,danger+cfg.dangerRise*cfg.missMultiplier);
      render();failIfFull();
    }
  });
  const decay=setInterval(()=>{
    const now=performance.now(),elapsed=Math.max(0,(now-lastUpdate)/1000);lastUpdate=now;
    if(done||ctx.isPaused?.())return;
    danger=Math.max(0,danger-cfg.dangerDecayPerSecond*elapsed);render();
  },Math.max(10,cfg.tickIntervalMs));
  render();
  return ()=>{done=true;clearInterval(decay);api.destroy();};
}
