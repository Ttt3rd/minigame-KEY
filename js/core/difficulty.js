export function stageScale(stage){return 1+Math.min(1.2,Math.max(0,stage-1)*0.055);}
export function adjustedDifficulty(ratio){return Math.max(.72,Math.min(1.45,1+(ratio-.55)*.45));}
export function gameParams(game,mode,stage,adaptive=1){
 const scale=stageScale(stage);
 return {time:mode==="LT"?Math.max(game.timeFloor,game.baseTime/scale):game.baseTime,
   difficulty:mode==="TA"?adaptive:scale};
}
