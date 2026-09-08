const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

const CATEGORIES = [
  "Chế giễu/xúc phạm","Ảnh & đời tư","Cô lập/tung tin","Đe dọa","Mâu thuẫn",
  "Tiền bạc/nợ","Cờ bạc trực tuyến","Vay trực tuyến","Lừa đảo trực tuyến","Khác"
];

const LAW_KB = `
KHO PHÁP LUẬT GIỚI HẠN V1.3.1:
- Bộ luật Dân sự 2015, Điều 32: quyền của cá nhân đối với hình ảnh.
- Bộ luật Dân sự 2015, Điều 34: danh dự, nhân phẩm, uy tín được pháp luật bảo vệ.
- Luật An ninh mạng 2018, Điều 29: bảo vệ trẻ em trên không gian mạng.
- Nghị định 56/2017/NĐ-CP, Điều 36: bảo vệ bí mật đời sống riêng tư của trẻ em trên môi trường mạng.
- Với cờ bạc, vay/nợ, lừa đảo, đe dọa, truy cập trái phép tài khoản và các hành vi khác: chỉ nói "có thể liên quan quy định pháp luật" khi phù hợp; KHÔNG tự nêu tội danh, mức phạt hay điều luật ngoài kho đã kiểm chứng.
- Không kết luận một học sinh "phạm luật" chỉ từ một câu kể. Phải phân biệt hành vi của người kể và hành vi của đối phương.
`;

const SYSTEM = `
Bạn là trợ lý giáo dục dành cho học sinh THPT Việt Nam. Mục tiêu không phải viết báo cáo kỹ thuật mà giúp học sinh bình tĩnh và biết phải làm gì.

PHẢI làm trước khi trả lời:
1) Lập bản đồ AI LÀM GÌ VỚI AI. Không gán hành vi của đối phương cho người kể.
2) Phân biệt người kể: người bị ảnh hưởng / người thực hiện / người chứng kiến / người cho vay / người vay / nhiều vai.
3) Tách từng hành vi. Ví dụ: "em cho A mượn tiền, sau mới biết A đánh bài" => em là người cho vay/bị ảnh hưởng; A là người đánh bài + người nợ. KHÔNG nói em tham gia đánh bài.
4) Nếu câu mơ hồ thật sự thì thừa nhận chưa đủ dữ kiện, không tự suy diễn.

ĐẦU RA CHO HỌC SINH CHỈ CÓ 4 PHẦN:
1. support: Động viên, giảm lo lắng, không phán xét; nếu người kể có hành vi sai thì hướng tới dừng và sửa.
2. safe_steps: 3-6 bước cụ thể, ưu tiên an toàn và đúng tình huống. Không đưa lời khuyên không liên quan.
3. legal: tách "Đối với em" và "Đối với người kia"; nêu hành vi không phù hợp/có thể liên quan pháp luật; không tự kết tội, không bịa điều luật/mức phạt.
4. final_advice: lời khuyên cuối, cân nhắc ảnh hưởng đến bản thân, đối phương, gia đình, nhà trường và xã hội.

QUY TẮC AN TOÀN:
- Không khuyên trả đũa, đánh nhau, hack, phát tán riêng tư, bêu xấu, ép buộc.
- Cờ bạc: dừng chơi/rủ rê/tiếp tay; không vay thêm để gỡ.
- Tiền/nợ: tách nghĩa vụ trả tiền khỏi bêu xấu/đe dọa; có thể nhờ người lớn hỗ trợ.
- Vay online/lừa đảo: không gửi OTP, phí trước, dữ liệu tài khoản; không vay mới để bù.
- Đe dọa bạo lực cụ thể hoặc dấu hiệu không an toàn: ưu tiên người lớn có trách nhiệm ngay.
- Người chứng kiến không cần đối đầu nếu không an toàn; báo người lớn để hỗ trợ không đồng nghĩa "mách lẻo".
- Giữ bằng chứng chỉ khi thật sự có nội dung cần lưu; không mặc định nói "gỡ bài/không phát tán" nếu tình huống không có bài đăng, ảnh hay tin nhắn riêng.

${LAW_KB}

Trả JSON thuần:
{
 "support":"...",
 "safe_steps":["..."],
 "legal":{"user_side":"...","other_side":"...","note":"..."},
 "final_advice":"...",
 "_diagnostics":{
   "situation_summary":"...",
   "user_role":"...",
   "actor_analysis":"...",
   "categories":["..."],
   "risk_level":"Thấp|Thấp-Trung bình|Trung bình|Trung bình-Cao|Cao|Rất cao|Chưa rõ",
   "need_clarification":false,
   "clarifying_question":""
 }
}
`;

function norm(s=""){
  return String(s).toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d")
    .replace(/[^\p{L}\p{N}\s]/gu," ").replace(/\s+/g," ").trim();
}
function rx(t, pattern){ return new RegExp(pattern, "i").test(t); }
function anyRx(t, patterns){ return patterns.some(p=>rx(t,p)); }
function uniq(a){ return [...new Set(a)]; }

function flagsFor(text){
  const t = norm(text);

  const gambling = anyRx(t, [
    "\\bdanh\\s*bai\\b","\\bco\\s*bac\\b","\\btai\\s*xiu\\b","\\bca\\s*cuoc\\b",
    "\\bgame\\s*bai\\b","\\bdo\\s*den\\b","\\bbet\\b"
  ]);
  const debt = anyRx(t, [
    "\\bmuon\\s*tien\\b","\\bcho\\s+.*\\bmuon\\b","\\bno\\s*tien\\b","\\bkhong\\s+co\\s+tien\\s+tra\\b",
    "\\bkhong\\s+tra\\b","\\bdoi\\s*tien\\b","\\bcho\\s*vay\\b","\\bkhoan\\s+no\\b",
    "\\bmuon\\s+(?:a|b|c|ban)\\b"
  ]);
  const onlineLoan = anyRx(t, [
    "\\bvay\\s*online\\b","\\bvay\\s*truc\\s*tuyen\\b","\\bapp\\s*vay\\b","\\bvay\\s*nong\\b",
    "\\bphi\\s*truoc\\b","\\bgiai\\s*ngan\\b"
  ]);
  const scam = anyRx(t, [
    "\\blua\\s*dao\\b","\\blink\\s*gia\\b","\\bgia\\s*mao\\b.*\\blink\\b","\\bmat\\s*tien\\b.*\\blink\\b",
    "\\bchuyen\\s*tien\\b.*\\bnham\\b","\\botp\\b.*\\bmat\\b"
  ]);
  const privacy = anyRx(t, [
    "\\bdang\\s+anh\\b","\\bphat\\s+tan\\s+anh\\b","\\bshare\\s+anh\\b","\\banh\\s+nhay\\s+cam\\b",
    "\\bvideo\\b","\\bclip\\b","\\bmeme\\b","\\btin\\s+nhan\\s+rieng\\b","\\bbi\\s+mat\\b",
    "\\brieng\\s+tu\\b","\\bcccd\\b","\\bdang\\s+thong\\s+tin\\s+ca\\s+nhan\\b"
  ]);
  const insult = anyRx(t, [
    "\\bxuc\\s+pham\\b","\\bbody\\s*shaming\\b","\\bche\\s+gieu\\b","\\bmiet\\s+thi\\b",
    "\\bchui\\b","\\bdo\\s+ngu\\b","\\bbeo\\b","\\bxau\\b.*\\bche\\b"
  ]);
  const rumor = anyRx(t, [
    "\\bnoi\\s+xau\\b","\\btin\\s+don\\b","\\bbia\\s+chuyen\\b","\\bco\\s+lap\\b",
    "\\btay\\s+chay\\b","\\bnick\\s+gia\\b","\\bboc\\s+phot\\b"
  ]);
  const threat = anyRx(t, [
    "\\bde\\s+doa\\b","\\bdoa\\s+danh\\b","\\bdanh\\s+may\\b","\\bgiet\\s+may\\b",
    "\\btong\\s+tien\\b","\\bcuong\\s+ep\\b","\\blieu\\s+hon\\b","\\bcho\\s+day\\b"
  ]);
  const conflict = anyRx(t, [
    "\\bcai\\s+nhau\\b","\\bmau\\s+thuan\\b","\\bgian\\s+nhau\\b","\\btra\\s+dua\\b",
    "\\bchia\\s+tay\\b","\\bnguoi\\s+yeu\\b"
  ]);
  const hacking = anyRx(t, ["\\bhack\\b","\\bchiem\\s+tai\\s+khoan\\b","\\bvao\\s+nick\\b.*\\bkhong\\s+xin\\b"]);

  const witness = anyRx(t, [
    "\\bem\\s+la\\s+c\\b","\\bem\\s+thay\\b","\\bem\\s+biet\\s+chuyen\\b",
    "\\bem\\s+chung\\s+kien\\b","\\bban\\s+em\\s+bi\\b"
  ]);

  const selfBorrow = anyRx(t, [
    "\\bem\\s+muon\\s+tien\\b","\\bem\\s+vay\\b","\\bem\\s+no\\b"
  ]);
  const selfGamble = gambling && anyRx(t, [
    "\\bem\\s+muon\\s+tien.*danh\\s*bai","\\bem\\s+danh\\s*bai","\\bem\\s+choi.*tai\\s*xiu",
    "\\bem\\s+ca\\s*cuoc","\\bem\\s+choi.*co\\s*bac"
  ]);

  const otherBorrowFromUser = anyRx(t, [
    "\\b(?:a|ban|ban\\s+em|no)\\s+muon\\s+tien\\s+em\\b",
    "\\bem\\s+cho\\s+(?:a|ban|ban\\s+em|no)\\s+muon\\b",
    "\\bem\\s+co\\s+cho\\s+(?:a|ban|ban\\s+em|no)\\s+muon\\b",
    "\\bcho\\s+ban\\s+em\\s+muon\\b",
    "\\bcho\\s+ban\\s+muon\\b"
  ]);
  const otherGamble = gambling && (
    otherBorrowFromUser ||
    anyRx(t, ["\\b(?:a|ban|ban\\s+em|no)\\s+.*danh\\s*bai","\\b(?:a|ban|ban\\s+em|no)\\s+.*tai\\s*xiu"])
  );

  const directVictim = anyRx(t, [
    "\\bem\\s+bi\\b","\\bchui\\s+em\\b","\\bde\\s+doa\\s+em\\b","\\bdang\\s+anh\\s+em\\b",
    "\\bnoi\\s+xau\\s+em\\b","\\btay\\s+chay\\s+em\\b"
  ]);

  const selfActor = anyRx(t, [
    "\\bem\\s+da\\s+dang\\b","\\bem\\s+dang\\s+anh\\b","\\bem\\s+chui\\b","\\bem\\s+share\\b",
    "\\bem\\s+gui\\s+anh\\b","\\bem\\s+de\\s+doa\\b","\\bem\\s+hack\\b"
  ]);

  const imminent = anyRx(t, [
    "\\btan\\s+hoc\\s+danh\\b","\\bmai\\s+danh\\b","\\bchieu\\s+nay\\s+danh\\b",
    "\\bdang\\s+cho\\s+ngoai\\s+cong\\b","\\bmang\\s+dao\\b","\\bco\\s+dao\\b","\\bgiet\\s+may\\b"
  ]);
  const selfHarm = anyRx(t, ["\\btu\\s+tu\\b","\\bmuon\\s+chet\\b","\\bbien\\s+mat\\b","\\bkhong\\s+muon\\s+song\\b"]);

  return {t,gambling,debt,onlineLoan,scam,privacy,insult,rumor,threat,conflict,hacking,witness,
          selfBorrow,selfGamble,otherBorrowFromUser,otherGamble,directVictim,selfActor,imminent,selfHarm};
}

function categoriesFrom(f){
  const c=[];
  if(f.insult) c.push("Chế giễu/xúc phạm");
  if(f.privacy) c.push("Ảnh & đời tư");
  if(f.rumor) c.push("Cô lập/tung tin");
  if(f.threat) c.push("Đe dọa");
  if(f.conflict) c.push("Mâu thuẫn");
  if(f.debt) c.push("Tiền bạc/nợ");
  if(f.gambling) c.push("Cờ bạc trực tuyến");
  if(f.onlineLoan) c.push("Vay trực tuyến");
  if(f.scam) c.push("Lừa đảo trực tuyến");
  return c.length ? uniq(c) : ["Khác"];
}

function roleAndActors(f){
  if(f.selfGamble){
    return {
      role:"Người tham gia đánh bạc + người vay/nợ",
      actors:"Người kể đã dùng/đang liên quan tiền vay để đánh bạc; người cho vay là người bị ảnh hưởng bởi khoản nợ."
    };
  }
  if(f.otherBorrowFromUser && f.otherGamble){
    return {
      role:"Người cho vay/bị ảnh hưởng",
      actors:"Người kể cho bạn/A mượn tiền; bạn/A là người dùng tiền để đánh bạc và hiện có nghĩa vụ giải quyết khoản nợ. Chưa có dữ kiện cho thấy người kể tham gia đánh bạc."
    };
  }
  if(f.witness && f.gambling && f.debt){
    return {
      role:"Người chứng kiến/người biết chuyện",
      actors:"Người kể biết chuyện; người khác là người đánh bạc/vay nợ. Người kể không tự động là người tham gia."
    };
  }
  if(f.selfBorrow && !f.selfGamble){
    return {role:"Người vay/nợ",actors:"Người kể đang có nghĩa vụ giải quyết khoản tiền đã mượn; cần tách việc trả nợ khỏi các mâu thuẫn khác."};
  }
  if(f.directVictim){
    return {role:"Người bị ảnh hưởng trực tiếp",actors:"Người kể đang là người bị tác động; cần ưu tiên an toàn và xác định hành vi cụ thể của đối phương."};
  }
  if(f.selfActor){
    return {role:"Người kể có hành vi cần dừng/khắc phục",actors:"Người kể đã mô tả một hành vi của chính mình; cần tập trung dừng hành vi và sửa hậu quả, không phán xét con người."};
  }
  if(f.witness){
    return {role:"Người chứng kiến/người biết chuyện",actors:"Người kể đang quan sát hoặc biết sự việc; không tự động gán hành vi của người khác cho người kể."};
  }
  if(f.otherBorrowFromUser){
    return {role:"Người cho vay/bị ảnh hưởng",actors:"Người kể là người cho mượn tiền; người kia là người đang nợ."};
  }
  return {role:"Chưa xác định chắc",actors:"Cần dựa vào toàn câu chuyện; nếu chủ thể chưa rõ thì không tự gán hành vi."};
}

function riskFrom(f, cats){
  if(f.imminent || f.selfHarm) return "Rất cao";
  if(f.hacking || anyRx(f.t,["\\btong\\s+tien\\b","\\banh\\s+nhay\\s+cam\\b","\\bphat\\s+tan\\s+anh\\s+rieng\\s+tu\\b"])) return "Cao";
  if(f.gambling && f.debt) return "Cao"; // khớp bộ 100 tình huống
  if(f.onlineLoan || f.scam) return "Cao";
  if(f.threat) return anyRx(f.t,["\\bcho\\s+day\\b","\\blieu\\s+hon\\b"]) ? "Chưa rõ" : "Cao";
  if(f.privacy || f.rumor) return "Trung bình-Cao";
  if(f.insult || f.debt || f.conflict) return "Trung bình";
  return "Thấp";
}

function supportFor(f, role){
  if(f.selfHarm) return "Mình rất quan tâm đến sự an toàn của em lúc này. Em không cần tự chịu một mình; hãy ở gần một người lớn em tin tưởng và nói ngay rằng em đang không ổn.";
  if(f.otherBorrowFromUser && f.otherGamble)
    return "Mình hiểu vì sao em lo và bối rối: em chỉ cho bạn mượn tiền, sau đó mới biết bạn dùng tiền để đánh bài và giờ chưa trả được. Theo điều em kể, chưa có dữ kiện cho thấy em tham gia đánh bài. Việc em tìm cách giải quyết bình tĩnh lúc này là rất đúng.";
  if(f.selfGamble)
    return "Việc thua tiền và đang nợ có thể làm em rất áp lực. Điều quan trọng là em đã nói ra và vẫn có thể dừng lại từ bây giờ. Mình sẽ tập trung giúp em xử lý khoản nợ an toàn, không phán xét em.";
  if(f.witness)
    return "Em có thể đang phân vân giữa giữ bí mật và sợ chuyện xấu hơn. Việc em quan tâm và tìm cách hỗ trợ an toàn là điều đáng quý; em không cần tự đứng ra giải quyết một mình.";
  if(role.includes("bị ảnh hưởng"))
    return "Nếu chuyện này làm em lo, buồn hoặc khó chịu thì cảm giác đó hoàn toàn dễ hiểu. Mục tiêu trước hết là giúp em an toàn và lấy lại quyền kiểm soát tình huống.";
  if(role.includes("hành vi cần dừng"))
    return "Việc em nhận ra hành vi của mình có thể gây ảnh hưởng là bước đầu rất quan trọng. Em vẫn có thể dừng lại, sửa hậu quả và chọn cách ứng xử tốt hơn từ bây giờ.";
  return "Mình sẽ cùng em tách từng việc một để em bớt rối và chọn cách xử lý an toàn, bình tĩnh, không làm tổn thương thêm ai.";
}

function safeStepsFor(f, risk){
  if(f.selfHarm){
    return [
      "Ở gần một người lớn em tin tưởng ngay lúc này và nói rõ rằng em đang không ổn.",
      "Không ở một mình nếu em sợ mình có thể làm điều nguy hiểm cho bản thân.",
      "Tạm rời khỏi tranh cãi/mạng xã hội và nhờ cha mẹ, giáo viên hoặc người có trách nhiệm hỗ trợ trực tiếp."
    ];
  }
  if(f.imminent){
    return [
      "Không đi gặp riêng hoặc đối đầu với người đang đe dọa em.",
      "Báo ngay cho cha mẹ, GVCN/giáo viên hoặc người có trách nhiệm ở trường.",
      "Nếu có tin nhắn đe dọa cụ thể, giữ lại phần cần thiết làm bằng chứng; không đăng công khai để trả đũa."
    ];
  }
  if(f.otherBorrowFromUser && f.otherGamble){
    return [
      "Không cho bạn mượn thêm tiền, kể cả khi bạn nói cần tiền để “gỡ” số đã thua.",
      "Trao đổi bình tĩnh về đúng khoản 500.000 đồng (hoặc số tiền thực tế) và thống nhất thời gian/cách trả phù hợp.",
      "Không bêu xấu, đe dọa hay đăng chuyện nợ nần của bạn lên mạng để ép trả tiền.",
      "Nếu bạn tiếp tục vay tiền để đánh bài, né tránh kéo dài, gây áp lực hoặc mâu thuẫn tăng lên, hãy nhờ cha mẹ/GVCN hoặc một người lớn đáng tin cậy hỗ trợ.",
      "Nếu có tin nhắn về việc vay tiền, em có thể giữ lại để làm rõ khoản nợ khi cần; không cần thu thập hay phát tán thông tin riêng tư không liên quan."
    ];
  }
  if(f.selfGamble){
    return [
      "Dừng đánh bài/cá cược ngay; không vay thêm tiền và không cố “gỡ” số đã thua.",
      "Nói thật với người đã cho em mượn tiền về tình trạng hiện tại và cùng thống nhất cách trả.",
      "Nhờ cha mẹ hoặc một người lớn đáng tin cậy hỗ trợ quản lý tiền và ngăn việc tiếp tục chơi.",
      "Rời/khóa các nhóm, link hoặc tài khoản khiến em dễ quay lại đánh bạc nếu em có thể làm an toàn."
    ];
  }
  if(f.witness && f.gambling && f.debt){
    return [
      "Không kể lan truyền cho bạn bè hoặc đăng sự việc lên mạng.",
      "Nếu người đang đánh bạc tiếp tục vay tiền, có nguy cơ nợ tăng hoặc kéo người khác vào, hãy trao đổi riêng với GVCN/cha mẹ/người lớn đáng tin cậy.",
      "Em không cần đối đầu trực tiếp hoặc hứa giữ bí mật tuyệt đối khi sự việc có thể gây hại."
    ];
  }

  const steps=[];
  if(f.onlineLoan){
    steps.push("Dừng tạo khoản vay mới; không chuyển phí trước, không cung cấp OTP hoặc mật khẩu.");
    steps.push("Nhờ cha mẹ/người lớn đáng tin cậy kiểm tra cùng các tin nhắn, khoản tiền và thông tin đã cung cấp.");
  }
  if(f.scam){
    steps.push("Dừng chuyển tiền/cung cấp thông tin thêm; lưu lại bằng chứng giao dịch hoặc tin nhắn cần thiết.");
    steps.push("Báo ngay cho cha mẹ/người lớn đáng tin cậy để cùng kiểm tra và xử lý; không vay thêm để bù số tiền đã mất.");
  }
  if(f.privacy){
    steps.push("Không chia sẻ lại nội dung riêng tư; nếu nội dung của em đang bị đăng, lưu bằng chứng cần thiết và nhờ người lớn hỗ trợ yêu cầu gỡ/báo cáo.");
  }
  if(f.insult || f.rumor){
    steps.push("Không đáp trả bằng xúc phạm hoặc bêu xấu; nói rõ ranh giới và dừng tranh cãi công khai.");
    if(f.rumor) steps.push("Nếu tin đồn/tẩy chay tiếp diễn, lưu phần thông tin cần thiết và báo GVCN/cha mẹ để được hỗ trợ.");
  }
  if(f.threat){
    steps.push("Không gặp riêng/đối đầu nếu em thấy không an toàn; nói ngay với người lớn đáng tin cậy.");
  }
  if(f.debt && !f.gambling){
    steps.push("Tách việc giải quyết khoản tiền khỏi việc xúc phạm, đe dọa hoặc trả đũa; thống nhất cách trả/nhận lại tiền rõ ràng.");
  }
  if(f.conflict){
    steps.push("Tạm dừng khi đang nóng giận, trao đổi ngắn gọn vào lúc bình tĩnh và tập trung vào hành vi cụ thể.");
  }
  if(!steps.length){
    steps.push("Dừng việc làm tình huống căng hơn và xác định điều em muốn giải quyết trước.");
    steps.push("Nếu em khó tự xử lý hoặc thấy không an toàn, nói với cha mẹ, GVCN hoặc người lớn em tin tưởng.");
  }
  if(["Cao","Rất cao"].includes(risk) && !steps.some(s=>/người lớn|cha mẹ|GVCN|giáo viên/i.test(s))){
    steps.unshift("Ưu tiên an toàn và nhờ cha mẹ, GVCN/giáo viên hoặc người lớn có trách nhiệm hỗ trợ sớm.");
  }
  return steps.slice(0,6);
}

function legalFor(f, role){
  let user_side = "Từ dữ kiện hiện có, chưa thấy căn cứ để kết luận em vi phạm pháp luật. Em vẫn cần tránh trả đũa, bêu xấu, đe dọa hoặc phát tán thông tin riêng tư khi giải quyết sự việc.";
  let other_side = "Chưa đủ dữ kiện để kết luận đối phương vi phạm pháp luật; cần xem hành vi cụ thể, độ tuổi, mức độ và hậu quả.";
  let note = "AI chỉ cung cấp góc nhìn giáo dục/pháp luật tham khảo, không thay thế kết luận của cơ quan có thẩm quyền.";

  if(f.otherBorrowFromUser && f.otherGamble){
    user_side = "Nếu em chỉ cho bạn mượn tiền và sau đó mới biết bạn dùng tiền để đánh bài, thì từ thông tin em kể chưa có căn cứ để nói em tham gia hành vi đánh bạc. Em không nên cho vay thêm để bạn tiếp tục chơi hoặc dùng cách đe dọa/bêu xấu để đòi tiền.";
    other_side = "Việc bạn dùng tiền để đánh bài trực tuyến có thể liên quan đến quy định pháp luật về cờ bạc; việc chưa trả tiền là vấn đề cần được giải quyết riêng. Trách nhiệm cụ thể phụ thuộc độ tuổi, tính chất, mức độ và tình tiết thực tế.";
    return {user_side,other_side,note};
  }
  if(f.selfGamble){
    user_side = "Việc em tham gia đánh bài/cá cược trực tuyến có thể liên quan đến quy định pháp luật về cờ bạc. Hệ thống không tự kết luận tội danh hay mức phạt; điều cần làm là dừng ngay và giải quyết khoản nợ an toàn.";
    other_side = "Người cho em mượn tiền có quyền yêu cầu giải quyết khoản nợ, nhưng nếu họ xúc phạm, đe dọa, cưỡng ép hoặc phát tán thông tin riêng tư thì các hành vi đó cần được xem xét riêng.";
    return {user_side,other_side,note};
  }
  if(f.privacy){
    user_side = role.includes("hành vi cần dừng") ? "Nếu em tự ý đăng/chia sẻ hình ảnh hoặc thông tin riêng tư của người khác, hành vi đó có thể xâm phạm quyền về hình ảnh, đời tư; em nên dừng và khắc phục." : user_side;
    other_side = "Nếu đối phương tự ý sử dụng/phát tán hình ảnh hoặc thông tin đời tư, có thể liên quan Điều 32 Bộ luật Dân sự 2015; với trẻ em còn có các quy định bảo vệ trên không gian mạng, trong đó có Điều 29 Luật An ninh mạng 2018 và Điều 36 Nghị định 56/2017/NĐ-CP.";
  }
  if(f.insult || f.rumor){
    other_side = "Hành vi xúc phạm, bịa đặt hoặc làm tổn hại danh dự/nhân phẩm có thể liên quan quyền được bảo vệ danh dự, nhân phẩm, uy tín theo Điều 34 Bộ luật Dân sự 2015. Cần xem đầy đủ nội dung và mức độ trước khi kết luận.";
  }
  if(f.threat){
    other_side = "Đe dọa, cưỡng ép hoặc tống tiền có thể liên quan quy định pháp luật, nhưng phải xem lời nói/hành vi cụ thể, mức độ, khả năng thực hiện và hậu quả; AI không tự kết luận tội danh.";
  }
  if(f.onlineLoan || f.scam){
    other_side = "Nếu có hành vi gian dối, chiếm đoạt tiền/dữ liệu, ép cung cấp OTP hoặc thu phí bất thường thì có thể liên quan quy định pháp luật; cần người lớn hỗ trợ kiểm tra và lưu bằng chứng cần thiết.";
  }
  if(f.hacking){
    user_side = role.includes("hành vi cần dừng") ? "Truy cập tài khoản của người khác khi không được phép là hành vi không đúng và có thể liên quan pháp luật; em nên dừng ngay và không sử dụng/chia sẻ dữ liệu lấy được." : user_side;
  }
  return {user_side,other_side,note};
}

function finalAdviceFor(f, risk){
  if(f.selfHarm || f.imminent)
    return "An toàn của em là ưu tiên cao nhất. Hãy để người lớn có trách nhiệm cùng xử lý ngay, để sự việc không gây thêm tổn thương cho em, người khác, gia đình và môi trường nhà trường.";
  if(f.otherBorrowFromUser && f.otherGamble)
    return "Em hãy tập trung lấy lại khoản tiền bằng cách bình tĩnh, rõ ràng và có người lớn hỗ trợ khi cần; không cho vay thêm, không trả đũa và cũng không làm bạn xấu hổ trước mọi người. Cách xử lý này vừa bảo vệ em, vừa cho bạn cơ hội dừng hành vi sai, đồng thời hạn chế ảnh hưởng đến gia đình, nhà trường và những người xung quanh.";
  if(f.selfGamble)
    return "Điều quan trọng nhất là dừng đánh bạc, không vay thêm để gỡ và chủ động nói thật để giải quyết khoản nợ. Sửa sớm sẽ giúp em giảm hậu quả cho bản thân, người cho vay, gia đình và việc học ở trường.";
  if(f.witness)
    return "Em không cần biến mình thành người phán xử. Hãy giữ kín thông tin không cần thiết, hỗ trợ đúng cách và tìm người lớn khi nguy cơ tăng; như vậy vừa bảo vệ người trong cuộc vừa giữ môi trường học đường an toàn.";
  return "Hãy chọn cách giải quyết không làm tổn thương thêm ai: bảo vệ mình, tôn trọng đối phương, nhờ gia đình/nhà trường hỗ trợ đúng lúc và không biến mâu thuẫn thành nội dung lan truyền trên mạng.";
}

function fallback(text){
  const f=flagsFor(text);
  const cats=categoriesFrom(f);
  const ra=roleAndActors(f);
  const risk=riskFrom(f,cats);
  const vagueThreat=f.threat && risk==="Chưa rõ";
  return {
    support:supportFor(f,ra.role),
    safe_steps:safeStepsFor(f,risk),
    legal:legalFor(f,ra.role),
    final_advice:finalAdviceFor(f,risk),
    _diagnostics:{
      situation_summary:`Vấn đề chính: ${cats.join(", ")}.`,
      user_role:ra.role,
      actor_analysis:ra.actors,
      categories:cats,
      risk_level:risk,
      need_clarification:vagueThreat,
      clarifying_question:vagueThreat ? "Lời đe dọa có nói rõ sẽ làm gì, khi nào/ở đâu, hoặc có dấu hiệu sắp xảy ra bạo lực không?" : ""
    }
  };
}

function normalizeGemini(obj,text){
  const fb=fallback(text);
  const out={...fb,...obj};
  if(!out.support || typeof out.support!=="string") out.support=fb.support;
  if(!Array.isArray(out.safe_steps) || out.safe_steps.length<2) out.safe_steps=fb.safe_steps;
  out.safe_steps=out.safe_steps.slice(0,6).map(String);
  if(!out.legal || typeof out.legal!=="object") out.legal=fb.legal;
  out.legal={
    user_side:String(out.legal.user_side||fb.legal.user_side),
    other_side:String(out.legal.other_side||fb.legal.other_side),
    note:String(out.legal.note||fb.legal.note)
  };
  if(!out.final_advice || typeof out.final_advice!=="string") out.final_advice=fb.final_advice;

  // Rules are authoritative for diagnostics to prevent Gemini from swapping actors.
  out._diagnostics=fb._diagnostics;
  return out;
}

async function askGemini(text){
  const key=process.env.GEMINI_API_KEY;
  if(!key) return null;
  const url=`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(key)}`;
  const body={
    systemInstruction:{parts:[{text:SYSTEM}]},
    contents:[{role:"user",parts:[{text}]}],
    generationConfig:{responseMimeType:"application/json",temperature:0.15,maxOutputTokens:1600}
  };
  const r=await fetch(url,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
  if(!r.ok) throw new Error(`Gemini HTTP ${r.status}`);
  const data=await r.json();
  const raw=data?.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("")||"";
  if(!raw) throw new Error("Gemini không trả nội dung");
  return JSON.parse(raw);
}

export function __testFallback(text){ return fallback(text); }

export default async (request) => {
  if(request.method!=="POST"){
    return new Response(JSON.stringify({error:"Method not allowed"}),{status:405,headers:{"content-type":"application/json"}});
  }
  try{
    const {text=""}=await request.json();
    const clean=String(text).trim().slice(0,3000);
    if(!clean){
      return new Response(JSON.stringify({error:"Em hãy nhập tình huống cần chia sẻ."}),{status:400,headers:{"content-type":"application/json"}});
    }

    let result=null, engine="rule-based-v1.3.1";
    try{
      const ai=await askGemini(clean);
      if(ai){ result=normalizeGemini(ai,clean); engine="gemini-free+rules-v1.3.1"; }
    }catch(err){
      console.error("Gemini fallback:",err?.message||err);
    }
    if(!result) result=fallback(clean);

    return new Response(JSON.stringify({...result,_engine:engine}),{
      status:200,
      headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}
    });
  }catch(err){
    console.error(err);
    return new Response(JSON.stringify({error:"Hệ thống chưa đọc được tình huống. Em vui lòng thử lại."}),{
      status:500,headers:{"content-type":"application/json"}
    });
  }
};
