export function showScreen(name){
 const target=document.getElementById(`screen-${name}`);
 if(!target){
  console.error(`[KEY//BREAK] Screen not found: screen-${name}`);
  return false;
 }
 document.querySelectorAll(".screen").forEach(screen=>screen.classList.remove("active"));
 target.classList.add("active");
 return true;
}
