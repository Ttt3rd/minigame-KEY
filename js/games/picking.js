export function mountPicking(root,ctx){
 let angle=0,step=0,clicks=0,danger=18,done=false,last=performance.now();
 root.innerHTML=`<div class="game-widget"><div class="lock-visual"><div class="pick-bar" id="pickBar"></div></div><p>角度を探り、正解位置でクリック連打！</p><input class="pick-angle" id="pickAngle" type="range" min="-90" max="90" value="0"><div class="danger-track"><div class="danger-fill" id="dangerFill"></div></div><small>危険ゲージ <b id="dangerText">18%</b></small><br><button class="btn primary big-action" id="pickClick">押し込む</button><div class="progress-track"><div class="progress-fill" id="pickProgress"></div></div><small id="pickStep">段階 1 / 3 ・ 0 / 5</small></div>`;
 const $=id=>root.querySelector("#"+id), targets=[-28+Math.random()*56,-28+Math.random()*56,-28+Math.random()*56];
 const update=()=>{$("pickBar").style.transform=`translate(-50%,-100%) rotate(${angle}deg)`;const good=Math.abs(angle-targets[step])<=ctx.config.angleTolerance;$("pickBar").classList.toggle("good",good);$("dangerFill").style.width=danger+"%";$("dangerText").textContent=Math.round(danger)+"%";$("pickProgress").style.width=((step*5+clicks)/15*100)+"%";$("pickStep").textContent=`段階 ${step+1} / 3 ・ ${clicks} / ${ctx.config.clicksPerStage}`;};
 $("pickAngle").addEventListener("input",e=>{angle=Number(e.target.value);update();});
 $("pickClick").addEventListener("click",()=>{if(done)return;if(Math.abs(angle-targets[step])<=ctx.config.angleTolerance){clicks++;danger=Math.min(100,danger+ctx.config.dangerRise);if(clicks>=ctx.config.clicksPerStage){step++;clicks=0;if(step>=3){done=true;ctx.onSuccess(100);return;}}}else{danger=Math.min(100,danger+ctx.config.dangerRise*1.4);}update();if(danger>=ctx.config.dangerLimit){done=true;ctx.onFail("危険ゲージが最大になった");}});
 const decay=setInterval(()=>{if(done||ctx.isPaused?.())return;danger=Math.max(0,danger-ctx.config.dangerDecay);update();},1000);
 return ()=>clearInterval(decay);
}
