export function showScreen(name){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));document.getElementById(`screen-${name}`).classList.add("active");}
