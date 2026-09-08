const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const CATS = [
  "Chế giễu/xúc phạm","Ảnh & đời tư","Cô lập/tung tin","Đe dọa",
  "Mâu thuẫn","Tiền bạc/nợ","Cờ bạc trực tuyến","Vay trực tuyến","Khác"
];

function showPage(target){
  const ids={home:'homePage',knowledge:'knowledgePage',assistant:'assistantPage',stats:'statsPage'};
  Object.values(ids).forEach(id=>document.getElementById(id)?.classList.add('hidden'));
  document.getElementById(ids[target])?.classList.remove('hidden');
  $$('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.target===target));
  window.scrollTo({top:0,behavior:'smooth'});
}
$$('.nav-btn').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.target)));
$$('.jump').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.target)));

const input=$("#student-input"), count=$("#char-count"), send=$("#send-btn"), log=$("#chat-log");
input.addEventListener("input",()=>count.textContent=`${input.value.length}/3000`);

function esc(s=""){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
function addMsg(type,html){
  const d=document.createElement("div"); d.className=`msg ${type}`; d.innerHTML=`<div class="bubble">${html}</div>`; if(log.querySelector(".placeholder")) log.innerHTML=""; log.appendChild(d); return d;
}
function arr(v){ return Array.isArray(v)?v:[]; }

function renderReport(r){
  const riskClass = ["trung bình-cao","cao","rất cao"].includes((r.risk_level||"").toLowerCase()) ? "risk-high" : "";
  return `<div class="ai-report">
    <div class="report-block ${riskClass}"><h4>🔎 1. Nhận diện tình huống</h4><p>${esc(r.situation_summary||"Chưa đủ thông tin để kết luận.")}</p></div>
    <div class="report-block"><h4>🧠 2. Phân tích</h4><p><b>Vai trò của em:</b> ${esc(r.user_role||"Chưa rõ")}</p>
      <p><b>Ai đang làm gì:</b> ${esc(r.actor_analysis||"Chưa đủ thông tin")}</p>
      <p><b>Nhóm vấn đề:</b> ${esc(arr(r.categories).join(", ")||"Khác")} • <b>Mức nguy cơ:</b> ${esc(r.risk_level||"Chưa rõ")}</p></div>
    <div class="report-block"><h4>❤️ 3. Lắng nghe & hỗ trợ</h4><p>${esc(r.empathy||"")}</p></div>
    <div class="report-block"><h4>🛡️ 4. Việc nên làm</h4><ul>${arr(r.next_steps).map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>
    <div class="report-block"><h4>🤝 5. Ứng xử văn hóa</h4><p>${esc(r.cultural_response||"")}</p></div>
    <div class="report-block legal"><h4>⚖️ 6. Góc nhìn pháp luật</h4><p>${esc(r.legal_view||"Không đủ căn cứ để nêu quy định cụ thể. Không nên tự kết luận vi phạm khi chưa rõ tình tiết.")}</p></div>
    <div class="report-block"><h4>🌱 7. Lời khuyên cuối</h4><p>${esc(r.final_message||"")}</p></div>
    ${r.need_clarification?`<div class="report-block"><h4>❓ AI cần hỏi thêm</h4><p>${esc(r.clarifying_question||"Em có thể kể thêm một chút để mình hiểu đúng hơn không?")}</p></div>`:""}
  </div>`;
}

function getStats(){
  return JSON.parse(localStorage.getItem("ksvh_stats")||'{"visits":0,"aiUses":0,"highRisk":0,"cats":{}}');
}
function saveStats(s){localStorage.setItem("ksvh_stats",JSON.stringify(s));}
(function visit(){const s=getStats(); if(!sessionStorage.getItem("countedVisit")){s.visits++;saveStats(s);sessionStorage.setItem("countedVisit","1");} renderStats();})();
function record(r){
  const s=getStats(); s.aiUses++;
  if(["trung bình-cao","cao","rất cao"].includes((r.risk_level||"").toLowerCase()))s.highRisk++;
  arr(r.categories).forEach(c=>{const key=CATS.includes(c)?c:"Khác";s.cats[key]=(s.cats[key]||0)+1;});
  saveStats(s);renderStats();
}
function renderStats(){
  const s=getStats();
  const v=document.getElementById('visits'), a=document.getElementById('ai-uses');
  if(v) v.textContent=s.visits||0; if(a) a.textContent=s.aiUses||0;
  const vh=document.getElementById('visitCount'), ah=document.getElementById('assistantCount');
  if(vh) vh.textContent=s.visits||0; if(ah) ah.textContent=s.aiUses||0;
  const box=document.getElementById('category-list'); if(!box) return;
  const max=Math.max(1,...CATS.map(c=>s.cats[c]||0));
  box.innerHTML=CATS.map(c=>`<div class="category-row"><span>${c}</span><div class="bar"><i style="width:${((s.cats[c]||0)/max)*100}%"></i></div><b>${s.cats[c]||0}</b></div>`).join('');
}

async function analyze(){
  const text=input.value.trim(); if(!text)return;
  addMsg("user",esc(text)); input.value=""; count.textContent="0/3000"; send.disabled=true;send.textContent="AI đang phân tích…";
  const loading=addMsg("ai","Đang đọc kỹ câu chuyện để xác định đúng ai làm gì với ai…");
  try{
    const res=await fetch("/.netlify/functions/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text})});
    const data=await res.json(); loading.remove();
    if(!res.ok) throw new Error(data.error||"Không kết nối được Trợ lý AI.");
    addMsg("ai",renderReport(data)); record(data);
  }catch(e){
    loading.remove(); addMsg("error",`⚠️ ${esc(e.message)}<br><small>Bản V1.3 vẫn có chế độ phân tích cục bộ miễn phí ngay cả khi dịch vụ AI ngoài tạm thời không khả dụng.</small>`);
  }finally{send.disabled=false;send.textContent="Phân tích cùng AI";}
}
send.addEventListener("click",analyze);
input.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key==="Enter")analyze();});

document.getElementById("reset-stats")?.addEventListener("click",()=>{if(confirm("Xóa toàn bộ thống kê thử nghiệm trên thiết bị này?")){localStorage.removeItem("ksvh_stats");renderStats();}});
