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
input.addEventListener("input",()=>{
  count.textContent=`${input.value.length}/3000`;
  // Nếu học sinh sửa câu hỏi khi AI còn xử lý, hủy yêu cầu cũ để tránh tư vấn nhầm.
  if(activeRequest){
    ++requestSequence;
    activeRequest.abort(); activeRequest=null;
    send.disabled=false; send.textContent="Phân tích cùng AI";
    log.querySelectorAll(".msg.ai").forEach(el=>{
      if(el.textContent.includes("Mình đang đọc kỹ câu chuyện")) el.remove();
    });
  }
});

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

// Thống kê tập trung: lưu ở Netlify Blobs, không lưu nội dung hội thoại.
const statsEndpoint = '/.netlify/functions/stats';
let systemStats = {visits:0,aiUses:0,cats:{},byDay:{}};
let statsPending = null;
function setStatsStatus(message){
  for(const el of document.querySelectorAll('.stat-status, #stats-connection')) el.textContent=message;
}

async function sendStat(type, categories=[]) {
  try {
    const res = await fetch(statsEndpoint, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({type,categories}), keepalive:true
    });
    if (!res.ok) throw new Error(`Lỗi ghi thống kê: HTTP ${res.status}`);
    await loadStats();
    return true;
  } catch (err) {
    console.warn('Thống kê chưa được lưu:',err);
    setStatsStatus('⚠️ Chưa ghi được lượt sử dụng lên hệ thống. Vui lòng thử lại.');
    return false;
  }
}
async function loadStats(){
  if(statsPending) return statsPending;
  statsPending=(async()=>{
    try {
      const res=await fetch(statsEndpoint,{cache:'no-store'});
      if(!res.ok) throw new Error(`Lỗi đọc thống kê: HTTP ${res.status}`);
      const data=await res.json();
      if(typeof data.visits!=='number' || typeof data.aiUses!=='number') throw new Error('Dữ liệu thống kê không hợp lệ');
      systemStats=data;
      renderStats();
      setStatsStatus('🟢 Đã kết nối thống kê tập trung – số liệu từ toàn hệ thống');
    } catch(err) {
      console.warn('Lỗi thống kê tập trung:',err);
      setStatsStatus('⚠️ Chưa kết nối được thống kê tập trung. Kiểm tra Netlify Functions → stats.');
    }
  })();
  try { await statsPending; } finally { statsPending=null; }
}
(async function visit(){
  await loadStats();
  if(!sessionStorage.getItem('systemVisitCounted')) {
    const saved=await sendStat('visit');
    if(saved) sessionStorage.setItem('systemVisitCounted','1');
  }
})();
function record(r){
  const d=r._diagnostics||{};
  const categories=[...new Set(arr(d.categories).map(c=>CATS.includes(c)?c:'Khác'))];
  sendStat('consult',categories);
}
function renderStats(){
  const s=systemStats;
  const v=document.getElementById('visits'), a=document.getElementById('ai-uses');
  if(v) v.textContent=s.visits||0; if(a) a.textContent=s.aiUses||0;
  const vh=document.getElementById('visitCount'), ah=document.getElementById('assistantCount');
  if(vh) vh.textContent=s.visits||0; if(ah) ah.textContent=s.aiUses||0;
  const box=document.getElementById('category-list'); if(!box) return;
  const max=Math.max(1,...CATS.map(c=>s.cats?.[c]||0));
  box.innerHTML=CATS.map(c=>`<div class="category-row"><span>${c}</span><div class="bar"><i style="width:${((s.cats?.[c]||0)/max)*100}%"></i></div><b>${s.cats?.[c]||0}</b></div>`).join('');
}
// Tự làm mới số liệu khi học sinh mở trang thống kê.
const oldShowPage=showPage;
showPage=function(target){oldShowPage(target);if(target==='stats')loadStats();};

let activeRequest = null;
let requestSequence = 0;
async function analyze(){
  const text=input.value.trim(); if(!text || send.disabled)return;
  const sequence=++requestSequence;
  activeRequest?.abort();
  activeRequest=new AbortController();
  // Mỗi lần gửi là một tình huống độc lập, không giữ tư vấn cũ trên màn hình.
  log.replaceChildren();
  addMsg("user",esc(text));
  input.value=""; count.textContent="0/3000"; send.disabled=true; send.textContent="AI đang lắng nghe…";
  const loading=addMsg("ai","Mình đang đọc kỹ câu chuyện để hiểu đúng ai làm gì với ai và tìm cách xử lý phù hợp…");
  try{
    const res=await fetch("/.netlify/functions/ai",{
      method:"POST",cache:"no-store",headers:{"Content-Type":"application/json","Cache-Control":"no-cache"},body:JSON.stringify({text}),signal:activeRequest.signal
    });
    const data=await res.json(); if(sequence!==requestSequence)return; loading.remove();
    if(!res.ok) throw new Error(data.error||"Không kết nối được Trợ lý AI.");
    addMsg("ai",renderReport(data)); record(data);
  }catch(e){
    if(sequence!==requestSequence || e.name==="AbortError")return;
    loading.remove();
    addMsg("error",`⚠️ ${esc(e.message)}<br><small>Bản V1.3.1 vẫn có bộ phân tích cục bộ miễn phí; em có thể thử lại sau ít phút.</small>`);
  }finally{
    if(sequence===requestSequence){send.disabled=false; send.textContent="Phân tích cùng AI"; activeRequest=null;}
  }
}
send.addEventListener("click",analyze);
input.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key==="Enter")analyze();});

// Không cho học sinh xóa dữ liệu toàn hệ thống.
// Demo: only prefill the student's input; never treat test expectations as actual AI results.
const demoSelect=document.getElementById("demo-select");
(window.DEMO_SCENARIOS||[]).forEach(item=>{
  const option=document.createElement("option"); option.value=item.id; option.textContent=item.label; demoSelect?.appendChild(option);
});
demoSelect?.addEventListener("change",()=>{
  const item=(window.DEMO_SCENARIOS||[]).find(x=>x.id===demoSelect.value);
  if(!item)return;
  input.value=item.text; input.dispatchEvent(new Event("input"));
  input.focus();
});
document.getElementById("clear-chat")?.addEventListener("click",()=>{
  ++requestSequence; activeRequest?.abort(); activeRequest=null;
  log.innerHTML='<div class="placeholder">Em có thể chọn một tình huống mẫu hoặc nhập câu chuyện mới. Nội dung trò chuyện trên màn hình đã được xóa.</div>';
  input.value=""; input.dispatchEvent(new Event("input"));
  if(demoSelect)demoSelect.value="";
  send.disabled=false; send.textContent="Phân tích cùng AI";
});
