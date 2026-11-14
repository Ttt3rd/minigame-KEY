const KEY="keybreak-alpha1";
const defaults={records:{LT:{bestStage:0,clears:0},TA:{bestScore:0,plays:0},FR:{plays:0,clears:0}},settings:{sound:true,shake:true}};
export function loadData(){try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||"{}")};}catch{return structuredClone(defaults);}}
export function saveData(data){localStorage.setItem(KEY,JSON.stringify(data));}
export function recordSession(data,session){
 const r=data.records;
 if(session.mode==="LT"){r.LT.bestStage=Math.max(r.LT.bestStage,session.stage);if(session.success)r.LT.clears++;}
 if(session.mode==="TA"){r.TA.bestScore=Math.max(r.TA.bestScore,session.score);r.TA.plays++;}
 if(session.mode==="FR"){r.FR.plays++;if(session.success)r.FR.clears++;}
 saveData(data);
}
