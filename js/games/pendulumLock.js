export function mountPendulum(root,ctx){
 let angle=-135,dir=1,progress=0,done=false,last=performance.now(),raf=0;
 root.innerHTML=`<div class="game-widget"><div class="meter"><div class="meter-zone"></div><div class="meter-needle" id="needle"></div><div class="meter-center"></div></div><p>色の付いた範囲に針が入った瞬間に押す。</p><div class="progress-track"><div class="progress-fill" id="unlockProgress"></div></div><small id="unlockText">解除度 0%</small><br><button class="btn primary big-action" id="strike">タイミングよく押す</button></div>`;
 const $=id=>root.querySelector("#"+id);
 const zoneCenter= -35, zoneHalf=ctx.config.zoneWidth/2;
 function frame(now){if(done)return;const dt=Math.min(.05,(now-last)/1000);last=now;if(!ctx.isPaused?.())angle+=dir*ctx.config.needleSpeed*65*dt;if(angle>135){angle=135;dir=-1;}if(angle< -135){angle=-135;dir=1;}$("needle").style.transform=`translate(-50%,-100%) rotate(${angle}deg)`;raf=requestAnimationFrame(frame);}
 raf=requestAnimationFrame(frame);
 $("strike").addEventListener("click",()=>{if(done)return;let diff=Math.abs((((angle-zoneCenter)+180)%360+360)%360-180);if(diff<=zoneHalf){progress=Math.min(100,progress+ctx.config.gain+(diff<zoneHalf*.35?ctx.config.centerBonus:0));}else{progress=Math.max(0,progress-ctx.config.missLoss);} $("unlockProgress").style.width=progress+"%";$("unlockText").textContent=`解除度 ${Math.round(progress)}%`;if(progress>=100){done=true;ctx.onSuccess(100);}});
 return ()=>{cancelAnimationFrame(raf);};
}
