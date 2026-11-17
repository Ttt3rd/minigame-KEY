import {showScreen} from "./ui/screenManager.js";
import {GameManager} from "./core/gameManager.js";
import {loadData,saveData,recordSession} from "./core/storage.js";
const appEl=document.getElementById("app");
const data=loadData();let selectedGame="picking",selectedMode="LT",randomMode=false,manager;
const $=id=>document.getElementById(id);
function app(){return {
 setTime(t){$("hud-time").textContent=t===Infinity?"∞":`${Math.ceil(t)}s`;},
 updateHud(s){$("hud-mode").textContent=s.mode;$("hud-stage").textContent=String(s.stage).padStart(2,"0");$("hud-score").textContent=s.score;},
 setGameInfo(name,id){$("game-name").textContent=name;$("game-kicker").textContent=`LOCK CHALLENGE / ${id.toUpperCase()}`;$("game-instruction").textContent=id==="picking"?"ウォークスペース内でカーソルを動かして角度を合わせ、正解位置でクリック連打！":"ウォークスペース内で、色の付いた範囲に針が入った瞬間にクリック！";$("game-status").textContent="IN PROGRESS";$("game-progress").textContent="";},
 showChoice(s){$("hud-stage").textContent=String(s.stage).padStart(2,"0");showScreen("choice");},
 finishSession(s,success,reason){recordSession(data,s);$("result-title").textContent=success?"SESSION COMPLETE": "GAME OVER";$("result-score").textContent=s.score;$("result-details").innerHTML=`<div class="record-card"><span>モード</span><b>${s.mode}</b></div><div class="record-card"><span>到達ステージ</span><b>${s.stage}</b></div><div class="record-card"><span>成功回数</span><b>${s.successes}</b></div><div class="record-card"><span>結果</span><b>${reason|| (success?"解錠成功":"失敗")}</b></div>`;showScreen("result");},
}};
manager=new GameManager(app());
function beginMode(mode,isRandom){selectedMode=mode;randomMode=isRandom;if(isRandom){const games=[...document.querySelectorAll("#screen-random-filter input:checked")].map(x=>x.value);if(!games.length){alert("ゲームを1つ以上選択してください。");return;}manager.startRandom(games,mode);}else manager.startSingle(selectedGame,mode);}
// 画面遷移ボタンは要素ごとにイベントを登録し、クリック委譲に依存しない。
// ボタン内の文字・small要素をクリックした場合も同じ処理になる。
document.querySelectorAll("button[data-action]").forEach(button=>{
 button.addEventListener("click",()=>{
  const action=button.dataset.action;
  switch(action){
   case "home": manager.stop(); showScreen("home"); break;
   case "single": randomMode=false; showScreen("game-select"); break;
   case "random": randomMode=true; showScreen("random-filter"); break;
   case "records": renderRecords(); showScreen("records"); break;
   case "settings": showScreen("settings"); break;
   case "to-mode": showScreen("mode-select"); break;
   case "back-select": showScreen(randomMode?"random-filter":"game-select"); break;
   case "random-to-mode": showScreen("mode-select"); break;
  }
 });
});

document.querySelectorAll("button[data-game]").forEach(button=>{
 button.addEventListener("click",()=>{
  document.querySelectorAll("[data-game]").forEach(item=>item.classList.remove("selected"));
  button.classList.add("selected");
  selectedGame=button.dataset.game;
 });
});

document.querySelectorAll("button[data-mode]").forEach(button=>{
 button.addEventListener("click",()=>beginMode(button.dataset.mode,randomMode));
});

document.querySelectorAll("button[data-next-game]").forEach(button=>{
 button.addEventListener("click",()=>manager.continueRandom(button.dataset.nextGame));
});
$("pauseBtn").addEventListener("click",()=>manager.pause());
$("resumeBtn").addEventListener("click",()=>manager.resume());
$("quitBtn").addEventListener("click",()=>{manager.stop();showScreen("home");});
$("retryBtn").addEventListener("click",()=>{if(randomMode){manager.startRandom(["picking","pendulum"],selectedMode);}else manager.startSingle(selectedGame,selectedMode);});
function renderRecords(){const r=data.records;$("records-content").innerHTML=`<div class="record-card"><span>LT 最高到達ステージ</span><b>${r.LT.bestStage}</b></div><div class="record-card"><span>LT クリア回数</span><b>${r.LT.clears}</b></div><div class="record-card"><span>TA ハイスコア</span><b>${r.TA.bestScore}</b></div><div class="record-card"><span>TA プレイ回数</span><b>${r.TA.plays}</b></div><div class="record-card"><span>FR プレイ回数</span><b>${r.FR.plays}</b></div><div class="record-card"><span>FR 成功回数</span><b>${r.FR.clears}</b></div>`;}
$("clearRecords").addEventListener("click",()=>{if(confirm("すべての記録を消去しますか？")){localStorage.removeItem("keybreak-alpha1");location.reload();}});
$("soundToggle").checked=data.settings.sound;$("shakeToggle").checked=data.settings.shake;
["soundToggle","shakeToggle"].forEach((id,i)=>$(id).addEventListener("change",()=>{data.settings[i?"shake":"sound"]=$(id).checked;saveData(data);}));
$("brandHome").addEventListener("click",e=>{e.preventDefault();manager.stop();showScreen("home");});
