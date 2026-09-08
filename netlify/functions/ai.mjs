const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

const CATEGORIES = [
  "Chế giễu/xúc phạm","Ảnh & đời tư","Cô lập/tung tin","Đe dọa","Mâu thuẫn",
  "Tiền bạc/nợ","Cờ bạc trực tuyến","Vay trực tuyến","Khác"
];

const LAW_KB = `
KHO TRI THỨC PHÁP LUẬT V1.3 (chỉ dùng khi thật sự liên quan; không suy diễn):
1) Bộ luật Dân sự 2015:
- Điều 32: cá nhân có quyền đối với hình ảnh của mình; việc sử dụng hình ảnh về nguyên tắc cần sự đồng ý, trừ các trường hợp luật quy định.
- Điều 34: danh dự, nhân phẩm, uy tín của cá nhân là bất khả xâm phạm và được pháp luật bảo vệ.
2) Luật An ninh mạng 2018, Điều 29: trẻ em có quyền được bảo vệ, giữ bí mật cá nhân, đời sống riêng tư và các quyền khác khi tham gia không gian mạng; cha mẹ, giáo viên và các chủ thể liên quan có trách nhiệm bảo vệ trẻ em trên không gian mạng.
3) Nghị định 56/2017/NĐ-CP, Điều 36: khi đưa thông tin bí mật đời sống riêng tư của trẻ em lên mạng phải tuân thủ yêu cầu đồng ý và bảo đảm an toàn thông tin theo quy định.
4) Với đánh bạc trực tuyến, vay/nợ, đe dọa, xúc phạm, truy cập trái phép tài khoản và các hành vi khác:
- Chỉ nói "có thể liên quan đến quy định pháp luật" nếu tình tiết phù hợp.
- KHÔNG tự nêu số điều, mức tiền phạt, tội danh hoặc hình phạt nếu kho V1.3 chưa có căn cứ đã kiểm chứng.
- Trách nhiệm cụ thể phụ thuộc độ tuổi, tính chất, mức độ, hậu quả và tình tiết thực tế.
`;

const SYSTEM = `
Bạn là Trợ lý AI giáo dục dành cho học sinh THPT Việt Nam. Nhiệm vụ: hỗ trợ nhận diện, phòng ngừa và ứng xử văn hóa trước bạo lực học đường và nguy cơ trên không gian mạng.

Bắt buộc:
- Lập bản đồ "ai làm gì với ai" trước khi kết luận. Không gán hành vi của A cho B/C.
- Một người có thể có nhiều vai trò; tách từng hành vi thay vì dán nhãn con người.
- Người chứng kiến không tự động là người thực hiện. Hành vi share/thả haha/cho mượn tài khoản/giới thiệu link có thể là tiếp tay tùy ngữ cảnh.
- Hiểu câu không dấu, sai chính tả, viết tắt; nếu quan hệ chủ thể chưa rõ thì hỏi lại.
- "Đùa" không mặc nhiên vô hại; im lặng/cười theo không phải đồng thuận.
- Không khuyên trả đũa, đánh nhau, hack, phát tán riêng tư, cờ bạc, vay để gỡ nợ.
- Đe dọa mơ hồ chưa đủ để tự động xếp Rất cao; hỏi thêm. Đe dọa bạo lực cụ thể/sắp xảy ra thì ưu tiên người lớn có trách nhiệm ngay.
- Dấu hiệu tuyệt vọng, muốn biến mất, không an toàn hoặc tự làm hại bản thân: ưu tiên an toàn con người, kết nối ngay với người lớn có trách nhiệm.
- Với tiền/nợ: tách việc trả nợ khỏi bêu xấu, đe dọa, cưỡng ép.
- Với cờ bạc: phân biệt người chơi, người rủ rê/tiếp tay, người cho vay, người chứng kiến.
- Với vay trực tuyến: không giới thiệu app/nguồn vay/cách vay; cảnh báo vòng nợ, phí trước, OTP, khai thác dữ liệu.
- Với nghi lừa đảo nhưng chưa đủ dữ kiện: cảnh báo mạnh nhưng không khẳng định chắc chắn tội danh.
- Không yêu cầu tên thật, địa chỉ, số điện thoại, tài khoản, OTP hoặc dữ liệu nhạy cảm.
- Pháp luật chỉ dùng kho dưới đây; không bịa điều luật, mức phạt, tội danh.

Mức nguy cơ: Thấp | Thấp-Trung bình | Trung bình | Trung bình-Cao | Cao | Rất cao | Chưa rõ.
Nhóm vấn đề chỉ dùng: ${CATEGORIES.join(" | ")}.

${LAW_KB}

Trả về JSON THUẦN, không markdown, đúng các trường:
{
 "situation_summary":"...",
 "user_role":"...",
 "actor_analysis":"...",
 "categories":["..."],
 "risk_level":"...",
 "empathy":"...",
 "next_steps":["...","..."],
 "cultural_response":"...",
 "legal_view":"...",
 "final_message":"...",
 "need_clarification":false,
 "clarifying_question":""
}
`;

function strip(s="") {
  return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d");
}
function has(t, words){ return words.some(w => t.includes(strip(w))); }
function uniq(a){ return [...new Set(a)]; }

function categoriesFor(t){
  const c=[];
  if(has(t,["chửi","chui","xúc phạm","xuc pham","body shaming","béo","beo","xấu","xau","ngu","đồ ngu","do ngu","miệt thị","miet thi","chế giễu","che gieu","trêu","treu"])) c.push("Chế giễu/xúc phạm");
  if(has(t,["ảnh","anh","video","clip","meme","tin nhắn riêng","tin nhan rieng","bí mật","bi mat","riêng tư","rieng tu","cccd","otp","đăng ảnh","dang anh","phát tán","phat tan","share ảnh","share anh"])) c.push("Ảnh & đời tư");
  if(has(t,["nói xấu","noi xau","tin đồn","tin don","bịa chuyện","bia chuyen","cô lập","co lap","tẩy chay","tay chay","giả mạo","gia mao","nick giả","nick gia","bóc phốt","boc phot"])) c.push("Cô lập/tung tin");
  if(has(t,["đe dọa","de doa","dọa đánh","doa danh","đánh mày","danh may","chờ đấy","cho day","giết","giet","ép","ep buoc","cưỡng ép","cuong ep","tống tiền","tong tien"])) c.push("Đe dọa");
  if(has(t,["cãi nhau","cai nhau","mâu thuẫn","mau thuan","giận nhau","gian nhau","trả đũa","tra dua","người yêu","nguoi yeu","chia tay"])) c.push("Mâu thuẫn");
  if(has(t,["mượn tiền","muon tien","nợ","no tien","đòi tiền","doi tien","cho vay","vay bạn","vay ban","500 ngàn","500 ngan","tiền","tien"])) c.push("Tiền bạc/nợ");
  if(has(t,["đánh bài","danh bai","cờ bạc","co bac","tài xỉu","tai xiu","cá cược","ca cuoc","bet","game bài","game bai","đỏ đen","do den"])) c.push("Cờ bạc trực tuyến");
  if(has(t,["vay online","vay trực tuyến","vay truc tuyen","app vay","vay nóng","vay nong","phí trước","phi truoc","giải ngân","giai ngan"])) c.push("Vay trực tuyến");
  return c.length ? uniq(c) : ["Khác"];
}

function riskFor(t,cats){
  const imminent = has(t,["mai đánh","mai danh","chiều nay đánh","chieu nay danh","tan học đánh","tan hoc danh","đang chờ ngoài cổng","dang cho ngoai cong","mang dao","có dao","co dao","giết mày","giet may","tự tử","tu tu","muốn chết","muon chet","biến mất","bien mat"]);
  if(imminent) return "Rất cao";
  if(has(t,["tống tiền","tong tien","cưỡng ép","cuong ep","hack","chiếm tài khoản","chiem tai khoan","phát tán ảnh riêng tư","phat tan anh rieng tu","ảnh nhạy cảm","anh nhay cam"])) return "Cao";
  if(cats.includes("Cờ bạc trực tuyến") && (cats.includes("Tiền bạc/nợ") || has(t,["thua","gỡ","go no","vay để chơi","vay de choi"]))) return "Cao";
  if(cats.includes("Vay trực tuyến")) return "Cao";
  if(cats.includes("Đe dọa")) return has(t,["chờ đấy","cho day","liệu hồn","lieu hon"]) ? "Chưa rõ" : "Cao";
  if(cats.includes("Ảnh & đời tư") || cats.includes("Cô lập/tung tin")) return "Trung bình-Cao";
  if(cats.includes("Chế giễu/xúc phạm") || cats.includes("Tiền bạc/nợ") || cats.includes("Mâu thuẫn")) return "Trung bình";
  return "Thấp";
}

function roleFor(t){
  if(has(t,["em thấy","em thay","em biết chuyện","em biet chuyen","em chứng kiến","em chung kien","bạn em bị","ban em bi"])) return "Người chứng kiến/người biết chuyện; cần hỗ trợ an toàn, không tự đối đầu nếu có nguy cơ.";
  if(has(t,["em bị","em bi","họ đăng ảnh em","ho dang anh em","nó chửi em","no chui em","bạn chửi em","ban chui em","đe dọa em","de doa em"])) return "Người đang bị tác động trực tiếp; cần ưu tiên an toàn, ranh giới và tìm hỗ trợ phù hợp.";
  if(has(t,["em đã đăng","em da dang","em chửi","em chui","em đánh","em danh","em share","em gửi","em gui","em mượn","em muon"])) return "Người đang kể có thể đã tham gia một phần hành vi; cần tách hành vi cụ thể và hướng tới dừng/khắc phục, không phán xét con người.";
  return "Chưa thể xác định chắc vai trò chỉ từ một số từ khóa; cần đọc quan hệ chủ thể trong toàn câu chuyện.";
}

function legalFor(cats){
  const p=[];
  if(cats.includes("Ảnh & đời tư")) p.push("Quyền đối với hình ảnh và đời tư có thể liên quan Điều 32 Bộ luật Dân sự 2015, Điều 29 Luật An ninh mạng 2018 và Điều 36 Nghị định 56/2017/NĐ-CP.");
  if(cats.includes("Chế giễu/xúc phạm") || cats.includes("Cô lập/tung tin")) p.push("Danh dự, nhân phẩm và uy tín được pháp luật bảo vệ; có thể tham khảo Điều 34 Bộ luật Dân sự 2015.");
  if(cats.some(x=>["Đe dọa","Tiền bạc/nợ","Cờ bạc trực tuyến","Vay trực tuyến"].includes(x))) p.push("Tình huống có thể liên quan quy định pháp luật khác, nhưng cần xem xét đầy đủ độ tuổi, tính chất, mức độ, hậu quả và tình tiết thực tế; hệ thống không tự kết luận tội danh hay mức phạt.");
  return p.length ? p.join(" ") : "Chưa thấy căn cứ cần nêu pháp luật cụ thể từ kho V1.3; trước hết nên tập trung vào cách ứng xử an toàn và văn hóa.";
}

function fallback(text){
  const t=strip(text);
  const cats=categoriesFor(t);
  const risk=riskFor(t,cats);
  const vagueThreat = cats.includes("Đe dọa") && risk==="Chưa rõ";
  const role=roleFor(t);
  const steps=[];
  if(["Cao","Rất cao"].includes(risk)) steps.push("Ưu tiên an toàn: tránh gặp riêng/đối đầu trực tiếp và báo ngay cho cha mẹ, giáo viên hoặc người lớn có trách nhiệm mà em tin cậy.");
  if(cats.includes("Ảnh & đời tư")) steps.push("Không phát tán thêm; lưu bằng chứng tối thiểu cần thiết để báo người có trách nhiệm và yêu cầu gỡ nội dung nếu có thể.");
  if(cats.includes("Cờ bạc trực tuyến")) steps.push("Dừng việc tham gia/rủ rê/tiếp tay; không vay thêm tiền để gỡ và nhờ người lớn hỗ trợ xử lý khoản nợ nếu có.");
  if(cats.includes("Vay trực tuyến")) steps.push("Không chuyển phí trước, không cung cấp OTP hay dữ liệu tài khoản; dừng tạo khoản vay mới và nhờ người lớn đáng tin cậy kiểm tra cùng.");
  if(cats.includes("Tiền bạc/nợ")) steps.push("Tách việc giải quyết khoản tiền khỏi việc bêu xấu, đe dọa hoặc trả đũa; trao đổi rõ ràng và có người lớn hỗ trợ nếu căng thẳng.");
  if(cats.includes("Chế giễu/xúc phạm") || cats.includes("Cô lập/tung tin") || cats.includes("Mâu thuẫn")) steps.push("Dừng tranh cãi công khai, đặt ranh giới rõ ràng và lưu lại thông tin cần thiết nếu hành vi tiếp diễn.");
  if(!steps.length) steps.push("Giữ bình tĩnh, không trả đũa và kể lại sự việc cho một người lớn đáng tin cậy nếu em thấy khó tự xử lý.");
  if(steps.length<2) steps.push("Nếu tình huống tiếp tục lặp lại hoặc khiến em thấy sợ/không an toàn, hãy tìm hỗ trợ trực tiếp từ giáo viên, phụ huynh hoặc người có trách nhiệm.");

  return {
    situation_summary:`Hệ thống nhận diện tình huống có thể liên quan đến: ${cats.join(", ")}.`,
    user_role:role,
    actor_analysis:"Bản miễn phí cục bộ đang tách hành vi theo người kể, người bị tác động và người thứ ba; nếu câu có nhiều A/B/C hoặc đại từ mơ hồ, cần hỏi thêm thay vì tự gán hành vi.",
    categories:cats,
    risk_level:risk,
    empathy:"Nếu chuyện này làm em lo, khó chịu hoặc bối rối thì cảm giác đó đáng được lắng nghe. Mục tiêu trước hết là giúp em an toàn và xử lý sự việc mà không làm tổn thương thêm ai.",
    next_steps:steps.slice(0,6),
    cultural_response:"Nói ngắn gọn, tôn trọng và tập trung vào hành vi: yêu cầu dừng điều làm em khó chịu; không xúc phạm, không bêu xấu, không trả đũa và không phát tán nội dung riêng tư.",
    legal_view:legalFor(cats),
    final_message:["Cao","Rất cao"].includes(risk) ? "Em không cần tự gánh tình huống này. Hãy ưu tiên an toàn và nhờ một người lớn có trách nhiệm hỗ trợ ngay." : "Em có thể xử lý từng bước: dừng leo thang, giữ bằng chứng cần thiết và tìm người lớn hỗ trợ khi tình huống vượt quá khả năng tự giải quyết.",
    need_clarification:vagueThreat,
    clarifying_question:vagueThreat ? "Lời đe dọa có nói rõ sẽ làm gì, khi nào/ở đâu, hoặc có dấu hiệu sắp gặp trực tiếp để đánh nhau không?" : ""
  };
}

function normalizeGemini(obj, text){
  const fb=fallback(text);
  const out={...fb,...obj};
  out.categories=Array.isArray(out.categories) ? out.categories.filter(x=>CATEGORIES.includes(x)) : fb.categories;
  if(!out.categories.length) out.categories=fb.categories;
  const risks=["Thấp","Thấp-Trung bình","Trung bình","Trung bình-Cao","Cao","Rất cao","Chưa rõ"];
  if(!risks.includes(out.risk_level)) out.risk_level=fb.risk_level;
  out.next_steps=Array.isArray(out.next_steps)&&out.next_steps.length>=2 ? out.next_steps.slice(0,6).map(String) : fb.next_steps;
  out.need_clarification=Boolean(out.need_clarification);
  out.clarifying_question=String(out.clarifying_question||"");
  return out;
}

async function askGemini(text){
  const key=process.env.GEMINI_API_KEY;
  if(!key) return null;
  const url=`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(key)}`;
  const body={
    systemInstruction:{parts:[{text:SYSTEM}]},
    contents:[{role:"user",parts:[{text}]}],
    generationConfig:{responseMimeType:"application/json",temperature:0.2,maxOutputTokens:1800}
  };
  const r=await fetch(url,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
  if(!r.ok) throw new Error(`Gemini HTTP ${r.status}`);
  const data=await r.json();
  const raw=data?.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("")||"";
  if(!raw) throw new Error("Gemini không trả nội dung");
  return JSON.parse(raw);
}

export default async (request) => {
  if(request.method!=="POST") return new Response(JSON.stringify({error:"Method not allowed"}),{status:405,headers:{"content-type":"application/json"}});
  try{
    const {text=""}=await request.json();
    const clean=String(text).trim().slice(0,3000);
    if(!clean) return new Response(JSON.stringify({error:"Em hãy nhập tình huống cần chia sẻ."}),{status:400,headers:{"content-type":"application/json"}});

    let result=null;
    let engine="rule-based";
    try{
      const ai=await askGemini(clean);
      if(ai){ result=normalizeGemini(ai,clean); engine="gemini-free+rules"; }
    }catch(err){ console.error("Gemini fallback:",err?.message||err); }
    if(!result) result=fallback(clean);

    return new Response(JSON.stringify({...result,_engine:engine}),{status:200,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});
  }catch(err){
    console.error(err);
    return new Response(JSON.stringify({error:"Hệ thống chưa đọc được tình huống. Em vui lòng thử lại."}),{status:500,headers:{"content-type":"application/json"}});
  }
};
