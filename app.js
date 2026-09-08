const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const CATS = [
  "Chế giễu/xúc phạm","Ảnh & đời tư","Cô lập/tung tin","Đe dọa",
  "Mâu thuẫn","Tiền bạc/nợ","Cờ bạc trực tuyến","Vay trực tuyến","Lừa đảo trực tuyến","Khác"
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

function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
function addMsg(type,html){
  const d=document.createElement("div");
  d.className=`msg ${type}`;
  d.innerHTML=`<div class="bubble">${html}</div>`;
  if(log.querySelector(".placeholder")) log.innerHTML="";
  log.appendChild(d);
  return d;
}
function arr(v){ return Array.isArray(v)?v:[]; }

function renderReport(r){
  const legal=r.legal||{};
  return `<div class="ai-report four-pillar">
    <div class="report-block support-block">
      <h4>❤️ 1. Mình cùng bình tĩnh nhé</h4>
      <p>${esc(r.support||"Mình sẽ cùng em xem từng việc một để tìm cách xử lý an toàn.")}</p>
    </div>

    <div class="report-block action-block">
      <h4>🛡️ 2. Em nên giải quyết thế nào?</h4>
      <ul>${arr(r.safe_steps).map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
    </div>

    <div class="report-block legal">
      <h4>⚖️ 3. Điều cần biết về pháp luật</h4>
      <p><b>Đối với em:</b> ${esc(legal.user_side||"Chưa đủ dữ kiện để kết luận em có vi phạm pháp luật.")}</p>
      <p><b>Đối với người kia:</b> ${esc(legal.other_side||"Cần xem hành vi cụ thể trước khi kết luận.")}</p>
      <p class="legal-note"><b>Lưu ý:</b> ${esc(legal.note||"Góc nhìn này chỉ mang tính tham khảo, không thay thế kết luận của cơ quan có thẩm quyền.")}</p>
    </div>

    <div class="report-block final-block">
      <h4>🌱 4. Lời khuyên dành cho em</h4>
      <p>${esc(r.final_advice||"Hãy ưu tiên an toàn, không trả đũa và tìm người lớn hỗ trợ khi cần.")}</p>
    </div>
  </div>`;
}

function getStats(){
  return JSON.parse(localStorage.getItem("ksvh_stats")||'{"visits":0,"aiUses":0,"highRisk":0,"cats":{}}');
}
function saveStats(s){localStorage.setItem("ksvh_stats",JSON.stringify(s));}
(function visit(){
  const s=getStats();
  if(!sessionStorage.getItem("countedVisit")){
    s.visits++; saveStats(s); sessionStorage.setItem("countedVisit","1");
  }
  renderStats();
})();
function record(r){
  const s=getStats(); s.aiUses++;
  const d=r._diagnostics||{};
  if(["trung bình-cao","cao","rất cao"].includes((d.risk_level||"").toLowerCase())) s.highRisk++;
  arr(d.categories).forEach(c=>{const key=CATS.includes(c)?c:"Khác";s.cats[key]=(s.cats[key]||0)+1;});
  saveStats(s); renderStats();
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
  addMsg("user",esc(text));
  input.value=""; count.textContent="0/3000"; send.disabled=true; send.textContent="AI đang lắng nghe…";
  const loading=addMsg("ai","Mình đang đọc kỹ câu chuyện để hiểu đúng ai làm gì với ai và tìm cách xử lý phù hợp…");
  try{
    const res=await fetch("/.netlify/functions/ai",{
      method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text})
    });
    const data=await res.json(); loading.remove();
    if(!res.ok) throw new Error(data.error||"Không kết nối được Trợ lý AI.");
    addMsg("ai",renderReport(data)); record(data);
  }catch(e){
    loading.remove();
    addMsg("error",`⚠️ ${esc(e.message)}<br><small>Bản V1.3.1 vẫn có bộ phân tích cục bộ miễn phí; em có thể thử lại sau ít phút.</small>`);
  }finally{
    send.disabled=false; send.textContent="Phân tích cùng AI";
  }
}
send.addEventListener("click",analyze);
input.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key==="Enter")analyze();});

document.getElementById("reset-stats")?.addEventListener("click",()=>{
  if(confirm("Xóa toàn bộ thống kê thử nghiệm trên thiết bị này?")){
    localStorage.removeItem("ksvh_stats"); renderStats();
  }
});
