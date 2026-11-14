import {GAME_CONFIG,MODE_CONFIG} from "./config.js";
import {gameParams} from "./difficulty.js";
import {GameTimer} from "./gameTimer.js";
import {mountPicking} from "../games/picking.js";
import {mountPendulum} from "../games/pendulumLock.js";
import {showScreen} from "../ui/screenManager.js";
import {createSingleSession} from "../modes/singleGame.js";
import {createRandomSession,chooseNext} from "../modes/randomGame.js";
export class GameManager{
 constructor(app){this.app=app;this.timer=new GameTimer(t=>app.setTime(t),()=>this.end(false,"時間切れ"));this.cleanup=null;this.session=null;this.paused=false;}
 startSingle(game,mode){this.session=createSingleSession(game,mode);this.startRound();}
 startRandom(games,mode){this.session=createRandomSession(games,mode);chooseNext(this.session);this.startRound();}
 startRound(){const s=this.session,g=GAME_CONFIG[s.game],p=gameParams(g,s.mode,s.stage,s.adaptive);this.cleanup?.();this.paused=false;this.app.updateHud(s);this.app.setGameInfo(g.name,s.game);showScreen("game");const mount=document.getElementById("game-mount");const ctx={config:{...g,...p},isPaused:()=>this.paused,onSuccess:()=>this.end(true),onFail:reason=>this.end(false,reason)};this.cleanup=s.game==="picking"?mountPicking(mount,ctx):mountPendulum(mount,ctx);if(s.mode==="FR")this.timer.start(Infinity);else if(s.mode==="LT")this.timer.start(p.time);else if(s.plays===0)this.timer.start(MODE_CONFIG.TA.duration);}
 end(success,reason=""){if(!this.session)return;const s=this.session;if(s.mode!=="TA")this.timer.stop();this.cleanup?.();this.cleanup=null;s.plays++;if(success){s.successes++;s.score+=Math.round(100*(s.mode==="TA"?s.adaptive:1));}if(s.mode==="TA"){const ratio=s.successes/Math.max(1,s.plays);s.adaptive=Math.max(.72,Math.min(1.45,s.adaptive+(success?.035:-.045)));if(this.timer.remaining<=0){this.finish(true);return;}if(s.type==="random"){chooseNext(s);this.startRound();return;}this.startRound();return;}
 if(s.mode==="FR"){if(s.type==="random"){this.app.showChoice(s);return;}this.finish(success,reason);return;}
 if(!success){this.finish(false,reason);return;}s.stage++;if(s.type==="random"){this.app.showChoice(s);return;}this.startRound();}
 continueRandom(game){chooseNext(this.session,game);this.startRound();}
 finish(success,reason=""){this.timer.stop();this.cleanup?.();this.app.finishSession(this.session,success,reason);this.session=null;}
 pause(){this.timer.pause();this.paused=true;document.getElementById("screen-pause").classList.add("active");}
 resume(){this.timer.resume();this.paused=false;document.getElementById("screen-pause").classList.remove("active");}
 stop(){this.timer.stop();this.cleanup?.();this.cleanup=null;this.session=null;}
}
