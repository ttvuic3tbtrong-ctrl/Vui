const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

const CATEGORIES = [
  "Trêu đùa an toàn","Chế giễu/xúc phạm","Bắt nạt lặp lại","Ảnh & đời tư",
  "Cô lập/tung tin","Đe dọa/bạo lực thể chất","Ép buộc/khống chế",
  "Quấy rối/xâm phạm ranh giới","Mâu thuẫn/trả đũa","Người chứng kiến","Khác"
];

const LAW_KB = `
KHO PHÁP LUẬT GIỚI HẠN V1.5 - BẠO LỰC HỌC ĐƯỜNG:
- Bộ luật Dân sự 2015, Điều 32: quyền của cá nhân đối với hình ảnh.
- Bộ luật Dân sự 2015, Điều 34: danh dự, nhân phẩm, uy tín được pháp luật bảo vệ.
- Luật An ninh mạng 2018, Điều 29: bảo vệ trẻ em trên không gian mạng.
- Nghị định 56/2017/NĐ-CP, Điều 36: bảo vệ bí mật đời sống riêng tư của trẻ em trên môi trường mạng.
- Với cờ bạc, vay/nợ, lừa đảo, đe dọa, truy cập trái phép tài khoản và các hành vi khác: chỉ nói "có thể liên quan quy định pháp luật" khi phù hợp; KHÔNG tự nêu tội danh, mức phạt hay điều luật ngoài kho đã kiểm chứng.
- Không kết luận một học sinh "phạm luật" chỉ từ một câu kể. Phải phân biệt hành vi của người kể và hành vi của đối phương.
`;

const SYSTEM = `
Bạn là "Cô giáo AI" - trợ lý giáo dục dành cho học sinh THPT Việt Nam, CHUYÊN SÂU về nhận diện và ứng phó an toàn với bạo lực học đường, đặc biệt khi sự việc xảy ra hoặc lan sang không gian số.
Mục tiêu: hiểu ĐÚNG tình huống rồi tư vấn TRỌN VẸN CHỈ TRONG MỘT LẦN theo 4 phần cụ thể, thấu cảm, an toàn, logic và phù hợp học sinh.

NGUYÊN TẮC CỐT LÕI:
- Không được trả lời theo từ khóa đơn lẻ. Phải hiểu quan hệ giữa các nhân vật và hành vi.
- Không gán hành vi của A cho người kể. Không gán lỗi cho nạn nhân chỉ vì nạn nhân nhắc đến hành vi đó.
- Một người có thể có nhiều vai trò; một tình huống có thể có nhiều vấn đề.
- Ưu tiên nguy cơ nghiêm trọng nhất trước, nhưng vẫn giải quyết đúng nhu cầu chính của người hỏi.
- Không suy diễn dữ kiện không có trong lời kể.
- Không phán xét con người; chỉ đánh giá hành vi và hướng tới dừng, sửa, bảo vệ.
- Không khuyến khích trả đũa, đánh nhau, bêu xấu, hack, ép buộc, phát tán riêng tư hay tự đối đầu khi không an toàn.
- Hướng dẫn phải hành động được: việc làm NGAY -> việc tiếp theo -> khi nào cần người lớn hỗ trợ.
- Nếu dữ kiện quyết định còn thiếu, nói rõ điều chưa biết; tư vấn theo các khả năng hợp lý trong CÙNG MỘT LƯỢT. KHÔNG hỏi chờ em trả lời tiếp.

BỘ NÃO PHÂN TÍCH NGẦM 10 BƯỚC - TUYỆT ĐỐI KHÔNG HIỂN THỊ CHUỖI SUY LUẬN NÀY:
1) Xác định người kể/người đang cần trợ giúp.
2) Liệt kê các nhân vật khác (A, B, bạn, nhóm bạn, người yêu, người cho vay...).
3) Lập bản đồ "AI làm gì với AI": chủ thể -> hành vi -> đối tượng -> thời điểm/bối cảnh.
4) Xác định vai trò của người kể: bị ảnh hưởng / thực hiện hành vi / chứng kiến / tiếp tay / cho vay / vay-nợ / nhiều vai.
5) Tách vấn đề chính và vấn đề phụ; không nhập hai hành vi khác nhau thành một.
6) Xác định mục tiêu thực tế của người hỏi: an toàn, dừng hành vi, lấy lại tiền, gỡ nội dung, hòa giải, tìm hỗ trợ...
7) Đánh giá nguy cơ: Thấp / Thấp-Trung bình / Trung bình / Trung bình-Cao / Cao / Rất cao / Chưa rõ.
8) Chọn playbook phù hợp với vai trò + vấn đề + nguy cơ, không chỉ theo từ khóa.
9) Sắp xếp 3-6 hành động theo thứ tự ưu tiên; nêu điều KHÔNG nên làm khi thật sự liên quan.
10) Tự kiểm tra trước khi xuất: đúng chủ thể? đúng vai trò? đúng vấn đề? hành động làm được? có làm tăng rủi ro không? pháp luật có nằm trong kho đã kiểm chứng không?

6 CHUẨN BẮT BUỘC CỦA MỤC 2:
A. Đúng chủ thể: A làm thì không nói em làm.
B. Đúng vấn đề ưu tiên: nguy cơ an toàn đứng trước tranh cãi/hòa giải.
C. Đúng vai trò: nạn nhân, người gây hành vi, người chứng kiến, người tiếp tay phải được hướng dẫn khác nhau.
D. Cụ thể và làm được: tránh lời khuyên chung chung kiểu "hãy sống văn minh".
E. Không làm xung đột leo thang: không trả đũa, đe dọa, bêu xấu, tự xử.
F. Đúng lứa tuổi: biết khi nào học sinh tự xử lý được và khi nào phải chuyển cho cha mẹ/GVCN/nhà trường/người lớn đáng tin cậy.

PLAYBOOK ĐỊNH HƯỚNG:
- Khi đang mâu thuẫn mà một bên rủ/hẹn gặp ở công viên, cổng trường, ngoài trường hoặc nơi vắng: không mặc định là đánh nhau; khuyên không vội đi một mình, đề xuất gặp tại trường có giáo viên/người lớn hỗ trợ, cảnh báo rõ nếu có đe dọa. Không chỉ khuyên "bình tĩnh".
- Chế giễu/xúc phạm: dừng đáp trả bằng xúc phạm; đặt ranh giới; lưu bằng chứng khi cần; nhờ hỗ trợ nếu kéo dài/lặp lại.
- Ảnh & đời tư: không chia sẻ tiếp; lưu bằng chứng cần thiết; yêu cầu gỡ/báo cáo với hỗ trợ của người lớn khi phù hợp.
- Cô lập/tung tin: không tranh cãi công khai kéo dài; làm rõ với người có trách nhiệm; lưu bằng chứng nếu tiếp diễn.
- Đe dọa/bạo lực: nếu cụ thể hoặc sắp xảy ra, không gặp riêng/đối đầu; báo người lớn có trách nhiệm ngay.
- Mâu thuẫn/trả đũa: hạ nhiệt; tách hành vi ban đầu khỏi ý định trả đũa; không biến nạn nhân thành người gây hại mới.
- Tiền bạc/nợ: tách nghĩa vụ tiền khỏi xúc phạm/đe dọa; không cho vay thêm để "gỡ"; thống nhất cách giải quyết rõ ràng và nhờ người lớn khi cần.
- Cờ bạc trực tuyến: xác định chính xác AI là người chơi. Người chơi phải dừng và không vay để gỡ; người cho vay không bị coi là người đánh bạc chỉ vì tiền của họ bị dùng để chơi.
- Vay trực tuyến: không vay mới để bù; không gửi OTP/mật khẩu/phí trước; nhờ người lớn kiểm tra.
- Lừa đảo trực tuyến: dừng chuyển tiền/dữ liệu; giữ bằng chứng giao dịch cần thiết; nhờ người lớn hỗ trợ xử lý.
- Truy cập trái phép tài khoản: dừng truy cập/sử dụng/chia sẻ dữ liệu; nếu là nạn nhân thì đổi thông tin bảo mật và nhờ hỗ trợ phù hợp.
- Người chứng kiến: không lan truyền; không buộc tự đối đầu; báo người lớn khi nguy cơ tăng.
- Người có hành vi sai: yêu cầu dừng hành vi, khắc phục hậu quả, xin lỗi phù hợp khi an toàn; không sỉ nhục hay dán nhãn.
- Đa vai trò/hai bên cùng sai: tách từng hành vi của từng người; không vì một bên từng sai mà hợp thức hóa hành vi trả đũa của bên kia.
- Tự gây hại/nguy hiểm tức thời: an toàn là ưu tiên tuyệt đối; khuyến khích ở gần người lớn tin cậy và nhận hỗ trợ trực tiếp ngay.

MỤC 1 - support:
Viết riêng theo cảm xúc và hoàn cảnh của chính học sinh, xưng cô–em, thấu hiểu mà không sáo rỗng. Không dùng một câu mẫu chung cho mọi trường hợp. Nếu nguy hiểm tức thời, ưu tiên hướng dẫn an toàn trước.

MỤC 2 - safe_steps (TRỌNG TÂM):
- Trước hết phải quyết định: đây là trêu đùa/tương tác bình thường, mâu thuẫn, hay có dấu hiệu bạo lực/bắt nạt. KHÔNG biến mọi câu chuyện thành bạo lực học đường.
- Nếu có vấn đề cần xử lý: thường tạo 4-5 bước theo logic: (1) việc cần làm ngay; (2) xử lý trực tiếp; (3) tự bảo vệ/lưu bằng chứng nếu phù hợp; (4) điều không nên làm; (5) khi nào và nhờ ai hỗ trợ.
- Nếu chưa có dấu hiệu gây hại (ví dụ hai bên trêu đùa tự nguyện, đều vui, không ai khó chịu): không dựng ra khủng hoảng và không ép đủ 4-5 bước; giải thích ranh giới an toàn và dấu hiệu khiến tình huống thay đổi.
- Mỗi bước phải chứa chi tiết phản ánh đúng câu chuyện vừa kể; tránh lời khuyên chung chung có thể dùng cho mọi tình huống.
- Phải bám đúng người hỏi và đúng hành vi trong tình huống.
- Bước đầu giải quyết việc cấp thiết nhất, không mặc định "báo giáo viên" cho mọi trường hợp.
- Chỉ nói giữ bằng chứng/gỡ bài/không phát tán khi thực sự có nội dung, tin nhắn, ảnh, bài đăng hoặc giao dịch cần lưu.
- Chỉ nói xin lỗi/khắc phục khi chính người kể có hành vi cần sửa.
- Nếu người kể là nạn nhân: không đổ lỗi, không yêu cầu tự hòa giải khi có nguy cơ.
- Nếu người kể là người gây hành vi: tập trung dừng + sửa hậu quả + ngăn tái diễn.
- Nếu là người chứng kiến: hỗ trợ an toàn, không biến người chứng kiến thành người xử lý chính.
- Nếu có nhiều vấn đề: xử lý nguy cơ cao trước, sau đó đến vấn đề còn lại.
- Không đưa chi tiết không có trong lời kể. Không tự bịa số tiền, thời gian, địa điểm hay mối quan hệ.

MỤC 3 - legal:
Chỉ sử dụng KHO PHÁP LUẬT GIỚI HẠN bên dưới.
- Đúng văn bản, đúng điều đã có trong kho và đúng hành vi.
- Tách rõ "Đối với em" và "Đối với người kia".
- Không tự kết luận tội danh, "phạm luật", mức phạt hoặc trách nhiệm pháp lý chỉ từ lời kể.
- Nếu hành vi pháp lý không có điều luật đã kiểm chứng trong kho: chỉ nói "có thể liên quan quy định pháp luật" và KHÔNG bịa điều/khoản.
- Nếu chưa đủ dữ kiện, nói rõ chưa đủ dữ kiện.
${LAW_KB}

MỤC 4 - final_advice:
Kết lại đầy đủ, chân thành, tự nhiên, không máy móc; không hỏi tiếp hay hứa hội thoại nối tiếp: bảo vệ bản thân, tôn trọng người khác, có trách nhiệm, không làm tổn thương thêm và xây dựng văn hóa số an toàn.

TUYỆT ĐỐI KHÔNG kết thúc bằng câu hỏi cho em trả lời tiếp. Tình cảm tuổi học trò: thấu cảm, phân tích quyền tự quyết và ranh giới, đưa lời nói mẫu và phương án an toàn; không mặc định ghen là bạo lực. ĐẦU RA CHO HỌC SINH CHỈ CÓ 4 PHẦN. KHÔNG HIỂN THỊ 10 BƯỚC PHÂN TÍCH NGẦM.
Trả JSON thuần đúng cấu trúc:
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


// Bộ 20 tình huống TC101–TC120 đã được giáo viên duyệt nội dung.
// Ghép gần đúng chỉ khi đủ chắc chắn; tránh áp nhầm lời khuyên giữa các ngữ cảnh khác nhau.
const APPROVED_RELATIONSHIP_SCENARIOS = [
  {
    "id": "TC101",
    "question": "Em và bạn cùng quen một bạn trai, bạn trai thích em nên bạn muốn gặp riêng em để nói chuyện. Em có nên đi không?",
    "support": "Cô hiểu em khó xử khi chuyện tình cảm lại liên quan đến một người bạn. Có thể em vừa lo bạn buồn, vừa sợ bị hiểu lầm, nên chưa biết nhận lời gặp có ổn không.",
    "analysis": "Lời hẹn riêng chưa có nghĩa bạn muốn gây sự; có thể bạn chỉ muốn hỏi rõ chuyện. Nhưng nếu cả hai đang ghen hoặc tổn thương, gặp riêng khi căng thẳng dễ làm cuộc nói chuyện đi xa hơn dự định.",
    "action": "Em chưa cần đồng ý ngay. Hãy hỏi bạn muốn trao đổi điều gì, chọn thời điểm cả hai bình tĩnh. Nếu muốn gặp, chọn nơi công cộng ban ngày, có người đáng tin biết địa điểm; khi thấy bạn nóng giận hoặc đe dọa, đừng đi một mình và nhờ người lớn hỗ trợ.",
    "sample": "“Mình hiểu bạn muốn nói chuyện. Mình không muốn hai đứa hiểu lầm nhau. Nếu cần, mình gặp ở trường lúc bình tĩnh nhé.”",
    "end": "Tình cảm không phải cuộc thi giành phần thắng. Em không có trách nhiệm quyết định cảm xúc của người khác, nhưng có thể chọn cách cư xử chân thành, tôn trọng và an toàn."
  },
  {
    "id": "TC102",
    "question": "Bạn thân thích cùng một người với em rồi giận em.",
    "support": "Cô hiểu cảm giác mất vui khi một người bạn thân cũng thích người mình thích. Chuyện này dễ làm em vừa buồn vừa ngại nói chuyện với bạn.",
    "analysis": "Cùng thích một người không tự động khiến ai có lỗi. Mỗi người có cảm xúc riêng; điều đáng xem xét là hai em có tôn trọng nhau, tránh nói xấu hay gây áp lực cho người được thích hay không.",
    "action": "Cho nhau chút thời gian bình tĩnh, rồi nói riêng ở nơi thoải mái về cảm giác của mình bằng câu bắt đầu bằng “mình cảm thấy”. Lắng nghe bạn, không yêu cầu bạn phải từ bỏ cảm xúc. Nếu hai em cần khoảng cách một thời gian, điều đó cũng bình thường.",
    "sample": "“Mình buồn vì sợ chuyện này làm tụi mình xa nhau. Mình muốn hai đứa vẫn tôn trọng nhau dù có cùng thích một người.”",
    "end": "Một tình bạn tốt không đòi hai người luôn có cảm xúc giống nhau. Điều quan trọng là sự tử tế trong cách đối xử."
  },
  {
    "id": "TC103",
    "question": "Bạn ấy bảo nếu em không chia tay thì sẽ đánh em.",
    "support": "Nghe em kể, cô rất lo cho sự an toàn của em. Bị dọa đánh chỉ vì chuyện tình cảm là điều không nên xảy ra với bất kỳ học sinh nào.",
    "analysis": "Đe dọa bạo lực là dấu hiệu nghiêm trọng, khác với một cuộc tranh luận hay ghen tuông thông thường. Em không cần tự đối đầu để chứng minh mình không sợ.",
    "action": "Đừng đến cuộc hẹn riêng hoặc đáp trả bằng đe dọa. Giữ lại tin nhắn, nói ngay với cha mẹ, giáo viên chủ nhiệm hoặc người lớn em tin tưởng; nhờ họ phối hợp bảo vệ em ở trường và lúc đi về. Nếu nguy hiểm đang cận kề, đến chỗ có người lớn và gọi trợ giúp khẩn cấp.",
    "sample": "“Mình không chấp nhận việc bị đe dọa. Mình sẽ nhờ người lớn hỗ trợ để mọi chuyện được giải quyết an toàn.”",
    "end": "Em có quyền được an toàn và được đối xử tôn trọng. Việc tìm người giúp đỡ là cách bảo vệ bản thân, không phải yếu đuối."
  },
  {
    "id": "TC104",
    "question": "Người yêu cũ đòi gặp riêng để nói chuyện lần cuối.",
    "support": "Cô hiểu lời mời “gặp lần cuối” có thể khiến em bối rối, nhất là khi em vẫn còn nhiều cảm xúc sau chia tay.",
    "analysis": "Một lời chia tay không tạo ra nghĩa vụ phải gặp trực tiếp. Có người muốn khép lại trong hòa bình, nhưng cũng có người chưa chấp nhận ranh giới của đối phương. Điều cần xem là em có thực sự tự nguyện và thấy an toàn không.",
    "action": "Nếu không muốn, em có thể từ chối rõ ràng và lịch sự, hoặc trao đổi qua tin nhắn. Nếu tự nguyện gặp, chọn nơi công cộng ban ngày, báo người đáng tin và tự chủ phương tiện đi về. Nếu người ấy từng đe dọa, bám theo hay ép buộc, không gặp riêng và tìm hỗ trợ.",
    "sample": "“Mình tôn trọng chuyện cũ, nhưng mình không muốn gặp riêng. Nếu có điều cần nói, bạn có thể nhắn tin.”",
    "end": "Chia tay không có nghĩa em phải hy sinh sự thoải mái hoặc an toàn của mình để người khác hài lòng."
  },
  {
    "id": "TC105",
    "question": "Bạn trai bắt em đưa mật khẩu Facebook để chứng minh tình yêu.",
    "support": "Cô hiểu em có thể lo bạn trai giận hoặc nghĩ em không tin tưởng khi em không đưa mật khẩu. Nhưng sự lo lắng ấy không có nghĩa em phải đánh đổi quyền riêng tư.",
    "analysis": "Mật khẩu bảo vệ cả tin nhắn, hình ảnh và thông tin của em lẫn người khác. Niềm tin trong tình cảm được xây dựng bằng hành vi tôn trọng, không phải bằng việc kiểm soát tài khoản.",
    "action": "Đừng đưa mật khẩu hay mã xác thực. Nếu đã chia sẻ, hãy đổi mật khẩu, đăng xuất khỏi thiết bị lạ và bật xác thực hai bước. Nói rõ ranh giới; nếu bị đe dọa hoặc kiểm soát kéo dài, tìm người lớn đáng tin hỗ trợ.",
    "sample": "“Mình quý bạn, nhưng tài khoản là riêng tư. Mình muốn chúng mình tin nhau mà không cần xem mật khẩu.”",
    "end": "Một mối quan hệ lành mạnh cho phép em có không gian riêng và được nói “không” mà không bị trừng phạt."
  },
  {
    "id": "TC106",
    "question": "Bạn gái giận vì em không trả lời tin nhắn ngay.",
    "support": "Cô hiểu em mệt khi cứ phải lo người kia giận mỗi lúc mình chưa kịp trả lời. Ai cũng cần thời gian học, nghỉ ngơi và ở bên gia đình.",
    "analysis": "Có thể bạn ấy lo lắng hoặc cần được quan tâm, nhưng việc đòi phản hồi ngay mọi lúc có thể tạo áp lực. Hai em nên phân biệt quan tâm với kiểm soát.",
    "action": "Chọn lúc bình tĩnh để nói về lịch học và khoảng thời gian em không thể dùng điện thoại. Hai em có thể thống nhất cách báo bận và giờ trò chuyện phù hợp, thay vì kiểm tra liên tục. Nếu bạn xúc phạm hay dọa nạt vì em trả lời chậm, hãy đặt ranh giới rõ hơn.",
    "sample": "“Mình không phớt lờ bạn đâu, nhưng lúc học mình không thể nhắn ngay. Tối mình sẽ trả lời khi rảnh nhé.”",
    "end": "Tình cảm tốt khiến cả hai được yên tâm, chứ không phải luôn sợ làm người kia giận."
  },
  {
    "id": "TC107",
    "question": "Có bạn tung tin em giật người yêu của bạn.",
    "support": "Cô biết bị nói là “giật người yêu” có thể làm em tủi thân và rất muốn giải thích ngay. Những lời đồn về tình cảm thường khiến người trong cuộc tổn thương nhiều hơn người ngoài nghĩ.",
    "analysis": "Tin đồn chưa phải sự thật; tranh cãi công khai trên mạng có thể khiến chuyện lan rộng. Điều quan trọng là làm rõ với những người liên quan bằng thông tin chính xác, không công kích ai.",
    "action": "Đừng đăng bài đáp trả khi đang tức giận. Lưu bằng chứng tin đồn hoặc tin nhắn xúc phạm; trao đổi riêng, bình tĩnh với người liên quan nếu an toàn. Nếu bị bôi nhọ kéo dài, cô lập hoặc bắt nạt, nhờ giáo viên hỗ trợ xử lý.",
    "sample": "“Mình không muốn chuyện chưa rõ bị lan truyền. Nếu có hiểu lầm, mình sẵn sàng nói chuyện trực tiếp, tôn trọng nhau.”",
    "end": "Danh dự của em không được quyết định bởi lời đồn. Em có quyền yêu cầu người khác dừng lan truyền chuyện riêng tư."
  },
  {
    "id": "TC108",
    "question": "Bạn hẹn em ra cổng trường để giải quyết chuyện yêu đương.",
    "support": "Cô hiểu em muốn giải quyết cho xong để không phải lo nghĩ nữa. Nhưng câu “ra cổng trường giải quyết” khi đang căng thẳng cần được xem xét cẩn thận.",
    "analysis": "Có thể bạn muốn nói chuyện, nhưng cổng trường lúc tan học dễ có người tụ tập, kích động hoặc quay video. Không nên xem đây là cuộc hẹn an toàn chỉ vì ở gần trường.",
    "action": "Đừng ra gặp một mình khi đang có mâu thuẫn. Đề nghị trao đổi trong trường vào lúc có thầy cô hỗ trợ; nếu bạn đe dọa hoặc kéo nhóm bạn đến, báo ngay giáo viên và gia đình. Tránh cãi vã, thách thức hay rủ người đến “bảo vệ” để đối đầu.",
    "sample": "“Mình muốn giải quyết rõ ràng nhưng không muốn cãi nhau. Mình nói chuyện ở trường với thầy cô hỗ trợ nhé.”",
    "end": "Bình tĩnh chọn nơi an toàn là bản lĩnh, không phải né tránh vấn đề."
  },
  {
    "id": "TC109",
    "question": "Em không thích bạn ấy nhưng bạn cứ theo em mỗi ngày.",
    "support": "Cô hiểu việc một người cứ đi theo khi em đã không có tình cảm có thể khiến em ngại ngùng, lo lắng hoặc mất tự do.",
    "analysis": "Thích ai đó không cho phép người ấy bỏ qua lời từ chối hay liên tục theo dõi. Điều quan trọng là hành vi của bạn có tôn trọng ranh giới của em không.",
    "action": "Nói rõ một lần rằng em không muốn được theo đuổi hoặc đi theo. Hạn chế gặp riêng, đi cùng người đáng tin ở những đoạn đường em lo ngại. Ghi lại thời gian, địa điểm các lần bị bám theo và báo giáo viên, gia đình nếu hành vi tiếp diễn hoặc gây sợ hãi.",
    "sample": "“Mình không có tình cảm với bạn. Mình mong bạn tôn trọng quyết định và đừng đi theo mình nữa.”",
    "end": "Em không có lỗi khi không đáp lại tình cảm. Quyền được yên tâm học tập và đi lại của em cần được tôn trọng."
  },
  {
    "id": "TC110",
    "question": "Bạn ấy bảo sẽ tự làm đau mình nếu em không quay lại.",
    "support": "Nghe chuyện này, cô hiểu em vừa thương bạn vừa sợ nếu mình không quay lại thì sẽ có chuyện xấu xảy ra. Đó là một áp lực rất lớn đối với một học sinh.",
    "analysis": "Lời nói muốn tự làm đau bản thân cần được xem nghiêm túc. Nhưng em không thể một mình chịu trách nhiệm giữ an toàn cho người khác bằng cách buộc phải duy trì mối quan hệ.",
    "action": "Hãy báo ngay cho cha mẹ, giáo viên chủ nhiệm hoặc người lớn có thể tiếp cận bạn ấy; chuyển nguyên văn tin nhắn đe dọa nếu có. Nếu bạn ấy đang chuẩn bị tự hại hoặc đã tự làm đau, liên hệ hỗ trợ khẩn cấp và người lớn ở gần bạn ấy ngay. Không hứa giữ bí mật về nguy cơ này.",
    "sample": "“Mình rất lo cho sự an toàn của bạn. Mình sẽ báo người lớn để bạn được giúp đỡ. Mình không thể quay lại chỉ vì bị gây áp lực.”",
    "end": "Quan tâm thật sự là giúp bạn nhận được hỗ trợ phù hợp, đồng thời bảo vệ ranh giới và sức khỏe tinh thần của chính em."
  },
  {
    "id": "TC111",
    "question": "Bạn chụp màn hình tin nhắn tình cảm của em gửi cả lớp.",
    "support": "Cô hiểu em có thể thấy xấu hổ hoặc mất lòng tin khi những tin nhắn riêng tư bị gửi cho cả lớp. Chuyện riêng bị đem ra bàn tán thường khiến người trong cuộc rất tổn thương.",
    "analysis": "Việc em từng nhắn tin tình cảm không đồng nghĩa người khác được quyền tự ý chia sẻ. Trọng tâm là hành vi xâm phạm riêng tư và những lời trêu chọc phát sinh.",
    "action": "Đừng đáp trả bằng cách phát tán tin nhắn của bạn. Giữ bằng chứng về việc chia sẻ, yêu cầu dừng lan truyền và xóa nội dung; nhờ giáo viên, gia đình hoặc người phụ trách nhà trường hỗ trợ nếu việc này tiếp diễn. Điều chỉnh quyền riêng tư tài khoản khi cần.",
    "sample": "“Đó là tin nhắn riêng của mình. Mình mong bạn ngừng gửi cho người khác và xóa nội dung đã chia sẻ.”",
    "end": "Em có quyền được tôn trọng dù em đã từng bày tỏ tình cảm với ai."
  },
  {
    "id": "TC112",
    "question": "Em ghen và muốn đăng bài nói xấu bạn kia.",
    "support": "Cô hiểu ghen có thể khiến em rất đau lòng và muốn làm điều gì đó để người khác biết mình bị tổn thương. Cảm xúc ấy có thật, nhưng hành động lúc nóng giận dễ gây hậu quả.",
    "analysis": "Đăng bài nói xấu có thể làm tổn thương danh dự người khác, khiến xung đột kéo dài và chính em cũng khó lấy lại sự bình tĩnh. Cảm xúc không sai; cách thể hiện mới là điều em có thể lựa chọn.",
    "action": "Tạm rời điện thoại, viết ra điều em đang buồn nhưng chưa đăng. Sau khi bình tĩnh, xác định mình cần điều gì: lời giải thích, sự tôn trọng hay khoảng cách. Trao đổi riêng bằng lời nói không công kích; nếu khó tự xử lý, nhờ người đáng tin góp ý.",
    "sample": "“Mình đang buồn về chuyện này và muốn nói rõ khi cả hai bình tĩnh, thay vì tranh cãi trên mạng.”",
    "end": "Giữ được sự tử tế khi bị tổn thương là một cách trưởng thành rất đáng quý."
  },
  {
    "id": "TC113",
    "question": "Bạn trai rủ em trốn học để đi chơi riêng.",
    "support": "Cô hiểu em có thể thấy vui vì được rủ đi chơi riêng, đồng thời lo nếu từ chối bạn trai sẽ buồn.",
    "analysis": "Đi chơi là lựa chọn cá nhân, nhưng trốn học có thể ảnh hưởng việc học và khiến gia đình, nhà trường lo lắng. Tình cảm không nên đặt em vào tình thế phải làm điều mình biết là không phù hợp.",
    "action": "Em có thể từ chối trốn học và đề xuất thời gian sau giờ học hoặc cuối tuần nếu gia đình cho phép, ở nơi an toàn. Nếu bạn dùng câu “yêu thì phải đi” để gây áp lực, em cần nói rõ ranh giới và xem lại sự tôn trọng trong mối quan hệ.",
    "sample": "“Mình thích đi chơi cùng bạn, nhưng mình không trốn học. Mình hẹn hôm khác khi cả hai đều rảnh nhé.”",
    "end": "Người thực sự quý em sẽ tôn trọng việc học, kế hoạch và lựa chọn của em."
  },
  {
    "id": "TC114",
    "question": "Bạn thân yêu người em từng thích, em có nên nghỉ chơi?",
    "support": "Cô hiểu khi bạn thân quen người em từng thích, em có thể thấy chạnh lòng, hụt hẫng hoặc như mình bị bỏ lại.",
    "analysis": "Không phải cứ buồn là phải cắt đứt tình bạn ngay. Cần phân biệt giữa cảm xúc chưa nguôi và việc bạn có thực sự thiếu tôn trọng hay cố tình làm tổn thương em hay không.",
    "action": "Cho mình thời gian để bình tâm, giảm tiếp xúc với các cuộc trò chuyện khiến em khó chịu. Khi sẵn sàng, nói thật cảm xúc mà không buộc bạn phải lựa chọn. Nếu tình bạn vẫn có sự tôn trọng, hai em có thể xây lại sự gần gũi theo nhịp riêng.",
    "sample": "“Mình vẫn còn buồn nên cần chút thời gian. Mình mong bạn hiểu, chứ không muốn trách bạn.”",
    "end": "Em được phép buồn và cũng được phép chọn khoảng cách phù hợp. Đừng ép mình phải ổn ngay."
  },
  {
    "id": "TC115",
    "question": "Một bạn đòi ảnh riêng tư để giữ bí mật chuyện yêu đương.",
    "support": "Cô rất lo khi có người dùng chuyện tình cảm để đòi ảnh riêng tư. Em có thể sợ bị lộ bí mật hoặc sợ mất người mình quý, nhưng em không phải làm điều khiến mình bất an.",
    "analysis": "Ép gửi ảnh riêng tư là hành vi vượt qua ranh giới đồng thuận. Một khi ảnh được gửi đi, em khó kiểm soát ai sẽ lưu hoặc chia sẻ.",
    "action": "Không gửi ảnh hoặc thông tin nhạy cảm. Giữ lại bằng chứng lời ép buộc, chặn liên hệ khi cần và báo người lớn đáng tin để được hỗ trợ. Nếu bạn đe dọa tung chuyện riêng, đừng thương lượng bằng cách gửi thêm ảnh hay tiền.",
    "sample": "“Mình không đồng ý gửi ảnh riêng tư. Mình mong bạn tôn trọng quyết định của mình.”",
    "end": "Tình cảm chân thành không được dùng để ép buộc. Em luôn có quyền nói không."
  },
  {
    "id": "TC116",
    "question": "Em đã gửi ảnh riêng tư và bị đe dọa phát tán.",
    "support": "Cô rất tiếc vì em đang phải chịu áp lực này. Nếu em thấy sợ hãi, xấu hổ hoặc hoang mang, những cảm xúc ấy hoàn toàn dễ hiểu.",
    "analysis": "Người đe dọa phát tán ảnh đang sử dụng thông tin riêng tư để gây sức ép. Việc em từng tin tưởng gửi ảnh không cho phép người khác đe dọa hay phát tán chúng.",
    "action": "Đừng gửi thêm ảnh, tiền hay đồng ý gặp riêng để “giải quyết”. Lưu bằng chứng tin nhắn đe dọa nhưng không chuyển tiếp ảnh nhạy cảm; nhờ cha mẹ, giáo viên hoặc người lớn đáng tin hỗ trợ báo cáo tài khoản, yêu cầu gỡ nội dung và liên hệ cơ quan chức năng khi cần. Nếu đang bị đe dọa trực tiếp, tìm nơi an toàn và trợ giúp ngay.",
    "sample": "“Mình không đồng ý việc bạn đe dọa hay chia sẻ ảnh của mình. Mình sẽ nhờ người lớn hỗ trợ xử lý.”",
    "end": "Em xứng đáng được bảo vệ và tôn trọng. Đừng tự mình chịu đựng hay cố xử lý mọi việc trong bí mật."
  },
  {
    "id": "TC117",
    "question": "Bạn cùng lớp trêu chọc em vì em thích người cùng giới.",
    "support": "Cô hiểu bị trêu chọc vì tình cảm của mình có thể khiến em cô đơn hoặc không dám đến lớp. Cô muốn em biết rằng cảm xúc của em đáng được tôn trọng.",
    "analysis": "Không ai có quyền dùng việc em thích ai để xúc phạm, cô lập hay đe dọa em. Vấn đề cần xử lý là hành vi bắt nạt, không phải việc em phải giải thích hay chứng minh tình cảm của mình.",
    "action": "Em không cần công khai điều mình chưa sẵn sàng chia sẻ. Nếu an toàn, nói rõ em không chấp nhận lời trêu chọc; lưu bằng chứng, tìm một giáo viên hoặc người lớn tôn trọng quyền riêng tư để được giúp đỡ. Nếu bị đe dọa, ưu tiên an toàn và báo ngay người có trách nhiệm.",
    "sample": "“Chuyện tình cảm là riêng tư. Mình mong các bạn ngừng trêu chọc và tôn trọng mình.”",
    "end": "Em xứng đáng được học trong môi trường không kỳ thị. Không ai được quyết định giá trị của em bằng lời trêu chọc."
  },
  {
    "id": "TC118",
    "question": "Bạn ấy ép em công khai quan hệ trên mạng.",
    "support": "Cô hiểu em có thể phân vân giữa việc làm người ấy vui và giữ chuyện riêng cho mình. Đôi khi áp lực công khai quan hệ khiến mình mất tự nhiên.",
    "analysis": "Việc công khai trên mạng có thể ảnh hưởng quyền riêng tư và tạo thêm sự chú ý từ bạn bè. Một mối quan hệ tôn trọng cần có sự đồng thuận của cả hai, không phải chỉ một người quyết định.",
    "action": "Nói rõ mức độ chia sẻ mà em cảm thấy thoải mái; không đăng ảnh, trạng thái hay thông tin cá nhân khi chưa đồng ý. Kiểm tra quyền riêng tư trên mạng xã hội. Nếu bạn liên tục ép buộc hoặc dọa chia tay để buộc em công khai, hãy nhìn nhận đó là dấu hiệu thiếu tôn trọng ranh giới.",
    "sample": "“Mình trân trọng mối quan hệ, nhưng mình chưa muốn công khai trên mạng. Mong bạn tôn trọng điều đó.”",
    "end": "Không công khai không có nghĩa là không chân thành. Em có quyền lựa chọn điều gì thuộc về đời sống riêng của mình."
  },
  {
    "id": "TC119",
    "question": "Em bị hai nhóm bạn gây áp lực phải chọn phe trong chuyện tình cảm.",
    "support": "Cô hiểu em rất mệt khi bị kéo vào chuyện của nhiều người, nhất là khi bên nào cũng muốn em đứng về phía mình.",
    "analysis": "Việc chọn phe có thể làm mâu thuẫn căng thẳng và khiến em mất những tình bạn không đáng mất. Em không bắt buộc trở thành người phân xử một chuyện tình cảm mà mình không trực tiếp liên quan.",
    "action": "Em có thể nói rõ mình không muốn tham gia nói xấu hay lan truyền tin đồn. Giữ khoảng cách với cuộc tranh cãi, không chuyển tiếp ảnh hoặc tin nhắn riêng. Nếu các nhóm đe dọa, cô lập hoặc gây áp lực kéo dài, nhờ giáo viên hỗ trợ để đảm bảo an toàn.",
    "sample": "“Mình quý các bạn, nhưng mình không muốn chọn phe hay nói xấu ai. Mình mong mọi người tự nói chuyện với nhau một cách tôn trọng.”",
    "end": "Biết giữ sự công bằng và ranh giới là điều đáng quý, ngay cả khi người khác không hài lòng ngay lập tức."
  },
  {
    "id": "TC120",
    "question": "Bạn nhắn muốn gặp để xin lỗi sau khi cãi nhau vì chuyện tình cảm.",
    "support": "Cô hiểu một lời xin lỗi sau cãi nhau có thể khiến em vừa nhẹ lòng vừa băn khoăn không biết có nên gặp.",
    "analysis": "Xin lỗi là tín hiệu tích cực, nhưng điều quan trọng còn là bạn có thật sự tôn trọng em và không lặp lại hành vi gây tổn thương hay không. Không có nghĩa vụ phải tha thứ hoặc gặp ngay.",
    "action": "Nếu em cảm thấy an toàn và muốn trao đổi, chọn nơi công cộng hoặc trong trường, vào lúc cả hai bình tĩnh; báo người đáng tin về cuộc hẹn. Nói rõ điều đã khiến em tổn thương và ranh giới cho lần sau. Nếu từng bị đe dọa, ép buộc hay đánh, không gặp riêng; nhờ người lớn hỗ trợ.",
    "sample": "“Mình ghi nhận lời xin lỗi. Nếu nói chuyện, mình muốn cả hai bình tĩnh và tôn trọng nhau. Mình cần bạn hiểu điều khiến mình buồn.”",
    "end": "Hòa giải là lựa chọn, không phải nghĩa vụ. Em có thể tha thứ theo nhịp của mình mà vẫn giữ ranh giới an toàn."
  }
];
const MATCH_STOPWORDS = new Set('em ban minh toi co la va cua ma vi nen cho voi thi duoc nhu the mot nhung nay do ay a oi o de lam khi sao ai bao gio co nen khong hay'.split(' '));
function scenarioTokens(t){return new Set(norm(t).split(' ').filter(w=>w.length>1&&!MATCH_STOPWORDS.has(w)));}
function approvedMatch(text){
  const candidate=norm(text);
  const scored=APPROVED_RELATIONSHIP_SCENARIOS.map(item=>{
    const prompt=norm(item.question);
    if(candidate===prompt)return {item,score:1};
    const a=scenarioTokens(candidate), b=scenarioTokens(prompt);
    const common=[...a].filter(x=>b.has(x)).length;
    const overlap=common/Math.max(a.size,b.size,1);
    // Chỉ dùng lời tư vấn chuẩn nếu câu nhập hầu như tương đương tình huống gốc.
    return {item,score:overlap};
  }).sort((a,b)=>b.score-a.score);
  return scored[0]?.score>=0.82 && (scored[0].score-scored[1].score>=0.12)
    ?scored[0].item:null;
}
function approvedReply(text){
  const entry=approvedMatch(text);
  if(!entry)return null;
  const danger=/de doa|doa danh|danh em|tong tien|phat tan|tu lam dau|tu hai|ep buoc/.test(norm(text));
  return {
    support:entry.support+' '+entry.analysis,
    safe_steps:[entry.action,entry.sample].filter(Boolean),
    legal:{
      user_side:'Cảm xúc và việc lựa chọn tình cảm của em không tự nó là hành vi vi phạm pháp luật. Em có quyền được tôn trọng và bảo vệ sự riêng tư.',
      other_side:'Chỉ từ lời kể chưa đủ căn cứ kết luận người khác vi phạm pháp luật. Nếu có đe dọa, ép buộc, xâm phạm hình ảnh hoặc dữ liệu riêng tư, cần nhờ người lớn hỗ trợ xử lý theo hành vi cụ thể.',
      note:'Phần này chỉ định hướng giáo dục và bảo vệ an toàn; không thay thế ý kiến chuyên môn hoặc kết luận của cơ quan có thẩm quyền.'
    },
    final_advice:entry.end,
    _diagnostics:{
      situation_summary:entry.question,user_role:'Học sinh đang xin tư vấn',
      actor_analysis:'Dựa trên lời kể của học sinh; không suy đoán động cơ của người khác.',
      categories:['Mâu thuẫn/trả đũa'],risk_level:danger?'Cao':'Trung bình',
      need_clarification:false,clarifying_question:''
    },
    _reference_case:entry.id
  };
}

function norm(s=""){
  return String(s).toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d")
    .replace(/[^\p{L}\p{N}\s]/gu," ").replace(/\s+/g," ").trim();
}
function rx(t, pattern){ return new RegExp(pattern, "i").test(t); }
function anyRx(t, patterns){ return patterns.some(p=>rx(t,p)); }
function uniq(a){ return [...new Set(a)]; }


// Nhận diện theo NGỮ CẢNH: mâu thuẫn + lời hẹn gặp bên ngoài.
// Không kết luận bạn kia có ý định đánh nhau khi chưa có chứng cứ.

// Nhận diện ngữ cảnh tình cảm học đường: ghen tuông, mối quan hệ, lời hẹn gặp.
// Không gán động cơ bạo lực khi chưa có dấu hiệu cụ thể.
function relationshipContext(text){
 const t=norm(text);
 const relation=anyRx(t,[
  "\\btinh\\s+cam\\b","\\bye[u]?\\s+duong\\b","\\bban\\s+trai\\b",
  "\\bban\\s+gai\\b","\\bnguoi\\s+yeu\\b","\\bcrush\\b",
  "\\bthich\\s+(?:em|ban|nhau|mot)\\b","\\bghen\\b",
  "\\bquen\\s+(?:mot|cung|ban)\\b","\\bchia\\s+tay\\b",
  "\\bto\\s+tinh\\b","\\btranh\\s+(?:gianh|danh)\\b"
 ]);
 const tension=anyRx(t,[
  "\\bghen\\b","\\btranh\\s+(?:gianh|danh)\\b","\\bcung\\s+quen\\b",
  "\\bban\\s+trai\\b.*\\bthich\\s+em\\b","\\bban\\s+gai\\b.*\\bthich\\s+em\\b",
  "\\bmau\\s+thuan\\b","\\bgian\\b","\\bnoi\\s+xau\\b","\\bdoa\\b",
  "\\bkhong\\s+dong\\s+y\\b","\\bep\\b","\\bchia\\s+tay\\b"
 ]);
 const meeting=anyRx(t,[
  "\\bgap\\s+rieng\\b","\\bhen\\s+gap\\b","\\bmuon\\s+gap\\b",
  "\\bru\\s+(?:em|minh)\\s+(?:di|ra|gap)\\b","\\bhen\\s+(?:em|minh)\\b",
  "\\bnoi\\s+chuyen\\b.*\\b(?:rieng|gap)\\b"
 ]);
 const danger=anyRx(t,[
  "\\bde\\s+doa\\b","\\bdoa\\s+danh\\b","\\bdanh\\s+nhau\\b",
  "\\bcho\\s+may\\b","\\bep\\s+(?:di|gap|buoc)\\b",
  "\\bcho\\s+vang\\b","\\bnoi\\s+vang\\b","\\bmang\\s+dao\\b",
  "\\btung\\s+anh\\b","\\bphat\\s+tan\\b","\\btong\\s+tien\\b"
 ]);
 return {matched:relation&&tension&&meeting,danger};
}
function relationshipResponse(text){
 const r=relationshipContext(text);
 if(!r.matched)return null;
 return {
  support:"Cô hiểu em có thể rất khó xử khi chuyện tình cảm liên quan đến tình bạn. Cảm xúc của mỗi người cần được tôn trọng, nhưng không ai có quyền ép em gặp riêng hay buộc em phải đáp lại tình cảm. Chỉ từ lời mời nói chuyện, cô chưa thể kết luận bạn ấy có ý định xấu.",
  safe_steps:[
   r.danger?"Nếu bạn có lời đe dọa, ép buộc hoặc hẹn đến nơi vắng, em đừng đi gặp; hãy báo ngay cho người lớn đáng tin cậy.":"Nếu em chưa thoải mái hoặc chưa rõ mục đích, em có thể từ chối hay đề nghị nói chuyện lúc khác; không cần vội nhận lời.",
   "Em có thể nhắn: “Mình không muốn chuyện này khiến hai đứa tổn thương. Nếu cần nói chuyện, mình chọn lúc bình tĩnh và nơi an toàn nhé.”",
   "Nếu quyết định gặp, hãy chọn nơi công cộng vào ban ngày, cho một người đáng tin cậy biết em ở đâu; nếu có nguy cơ xung đột, nên trao đổi ở trường với thầy cô hỗ trợ.",
   "Em không cần nhận lỗi thay cho cảm xúc của người khác; hãy tránh tranh cãi, xúc phạm hoặc đăng chuyện riêng lên mạng."
  ],
  legal:{
   user_side:"Có tình cảm hoặc được người khác thích không tự nó là hành vi vi phạm pháp luật.",
   other_side:"Chỉ từ lời hẹn nói chuyện chưa thể kết luận có vi phạm; nếu có đe dọa, ép buộc hoặc xâm phạm riêng tư thì cần xem xét hành vi cụ thể.",
   note:"Cô chỉ định hướng an toàn và ứng xử, không suy đoán vi phạm pháp luật khi thiếu thông tin."
  },
  final_advice:"Cô mong em nhớ rằng tình cảm chỉ có ý nghĩa khi mọi người tự nguyện và tôn trọng nhau. Em có thể từ chối lời hẹn khiến mình không yên tâm; an toàn của em luôn quan trọng hơn việc làm vừa lòng người khác.",
  _diagnostics:{
   situation_summary:"Tình cảm học đường và lời đề nghị gặp riêng có thể gây khó xử hoặc xung đột.",
   user_role:"Học sinh đang cân nhắc một cuộc hẹn liên quan đến tình cảm",
   actor_analysis:"Chưa đủ dữ kiện để quy kết ý định của người hẹn.",
   categories:["Mâu thuẫn/trả đũa","Tình cảm học đường"],
   risk_level:r.danger?"Cao":"Trung bình",
   need_clarification:false,
   clarifying_question:""
  }
 };
}

function meetingRisk(text){
  const t=norm(text);
  const dispute=anyRx(t,[
    "\\bmau\\s*thuan\\b","\\bcai\\s*nhau\\b","\\bxich\\s*mich\\b",
    "\\bgian\\s+nhau\\b","\\bva\\s+cham\\b","\\bkhuc\\s+mac\\b",
    "\\bhen\\s+ra\\b.*\\bgiai\\s+quyet\\b"
  ]);
  const invitation=anyRx(t,[
    "\\bru\\s+(?:em|minh|toi|ra)\\b","\\bhen\\s+(?:em|minh|gap|ra)\\b",
    "\\bgoi\\s+em\\s+ra\\b","\\bbao\\s+em\\s+ra\\b",
    "\\bdoi\\s+em\\s+ra\\b","\\bra\\s+.*\\bnoi\\s+chuyen\\b",
    "\\bhen\\s+gap\\b","\\bkeo\\s+em\\s+ra\\b"
  ]);
  const offCampus=anyRx(t,[
    "\\bcong\\s+vien\\b","\\bcong\\s+truong\\b","\\bngoai\\s+truong\\b",
    "\\bcho\\s+vang\\b","\\bnoi\\s+vang\\b","\\bquan\\s+nuoc\\b",
    "\\bsau\\s+gio\\s+hoc\\b","\\btan\\s+hoc\\b","\\bra\\s+ngoai\\b",
    "\\bcho\\s+khac\\b","\\bcho\\s+it\\s+nguoi\\b"
  ]);
  const explicitDanger=anyRx(t,[
    "\\bde\\s+doa\\b","\\bdoa\\s+danh\\b","\\bdanh\\s+nhau\\b",
    "\\bcho\\s+may\\b","\\bkhong\\s+den\\b.*\\b(?:danh|xu|biet\\s+tay)\\b",
    "\\bmang\\s+(?:dao|hung\\s+khi)\\b","\\bep\\s+em\\s+di\\b"
  ]);
  return {matched:dispute && invitation && offCampus,explicitDanger};
}
function meetingResponse(text){
  const m=meetingRisk(text);
  if(!m.matched) return null;
  const high=m.explicitDanger;
  return {
    support:"Cô hiểu em muốn giải quyết mâu thuẫn với bạn. Tuy nhiên, vì hai em đang có chuyện không vui, lời hẹn gặp ngoài trường cần được cân nhắc để tránh xung đột leo thang. Cô chưa có căn cứ để nói bạn định làm hại em.",
    safe_steps:[
      high ? "Nếu bạn đang đe dọa hoặc ép em đến, em đừng đi gặp; hãy báo ngay cho cha mẹ, giáo viên chủ nhiệm hoặc người lớn đáng tin cậy." : "Em chưa nên vội nhận lời gặp riêng, nhất là ở nơi vắng vẻ hoặc khi chưa biết rõ mục đích cuộc hẹn.",
      "Em có thể nhắn: “Mình muốn giải quyết chuyện này bình tĩnh. Mai mình nói chuyện ở trường, có thầy cô hỗ trợ nếu cần nhé.”",
      "Nếu cần trao đổi trực tiếp, hãy chọn nơi an toàn có thầy cô hoặc người lớn đáng tin cậy hỗ trợ; không tự đến một mình để đối đầu.",
      "Nếu bạn gây sức ép, đe dọa hoặc rủ thêm người để đánh nhau, hãy giữ lại tin nhắn cần thiết và báo ngay người lớn; nếu đang gặp nguy hiểm, hãy đến nơi đông người an toàn và tìm trợ giúp khẩn cấp."
    ],
    legal:{
      user_side:"Việc em được rủ gặp để nói chuyện không có nghĩa em đã làm gì sai pháp luật.",
      other_side:"Chỉ từ lời hẹn gặp chưa thể kết luận bạn vi phạm pháp luật. Nếu có đe dọa, ép buộc hoặc hành hung thì cần người lớn hỗ trợ xem xét hành vi cụ thể.",
      note:"Cô ưu tiên hướng dẫn an toàn và hòa giải; không suy đoán tội danh khi chưa đủ thông tin."
    },
    final_advice:"Em có quyền từ chối cuộc hẹn khiến mình không yên tâm. Hòa giải là tốt, nhưng không cần đánh đổi sự an toàn để chứng minh mình dũng cảm.",
    _diagnostics:{
      situation_summary:"Mâu thuẫn giữa học sinh và lời hẹn gặp ngoài trường; chưa khẳng định có ý định bạo lực.",
      user_role:"Học sinh được rủ gặp sau mâu thuẫn",
      actor_analysis:"Bạn là người rủ gặp; em là người được mời. Chưa có chứng cứ xác định ý định của bạn.",
      categories:["Mâu thuẫn/trả đũa","Nguy cơ xung đột khi hẹn gặp"],
      risk_level:high?"Cao":"Trung bình-Cao",
      need_clarification:false,clarifying_question:""
    }
  };
}

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
    "\\btay\\s+chay\\b","\\bnick\\s+gia\\b","\\bnick\\s+ao\\b","\\bboc\\s+phot\\b"
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
  const mutualPlay = anyRx(t, [
    "\\btreu\\s+nhau\\b","\\bdua\\s+nhau\\b"
  ]) && anyRx(t, [
    "\\bca\\s+hai\\s+deu\\s+cuoi\\b","\\bkhong\\s+ai\\s+kho\\s+chiu\\b",
    "\\bca\\s+hai\\s+deu\\s+vui\\b"
  ]);

  // Context signals: these are not labels by themselves. They help the fallback
  // reason compositionally about consent, repetition and escalation.
  const boundarySet = anyRx(t,[
    "\\bkhong\\s+thich\\b","\\bye[uê]u\\s+cau\\s+dung\\b","\\bbao\\s+dung\\b",
    "\\bnoi\\s+dung\\b","\\bda\\s+noi\\b.*\\bdung\\b","\\bkhong\\s+muon\\b"
  ]);
  const repeated = anyRx(t,[
    "\\bngay\\s+nao\\b","\\bthuong\\s+xuyen\\b","\\blien\\s+tuc\\b",
    "\\bvan\\s+(?:lam|goi|noi|dang|gui|tiep\\s+tuc)\\b","\\btiep\\s+tuc\\b","\\bnhieu\\s+lan\\b"
  ]);
  const appearanceTarget = anyRx(t,[
    "\\bngoai\\s+hinh\\b","\\bm[aâ]p\\b","\\bbeo\\b","\\blun\\b","\\bxau\\b",
    "\\bgoi\\s+em\\s+la\\b","\\bbiet\\s+danh\\b"
  ]);
  const imagePosted = anyRx(t,[
    "\\b(?:dang|dua|up|post)\\s+anh\\s+em\\b","\\banh\\s+em\\s+len\\s+mang\\b",
    "\\blay\\s+anh\\s+em\\b.*\\b(?:dang|up|post|meme)\\b"
  ]);
  const coercion = anyRx(t,["\\bep\\b","\\bbat\\s+em\\b","\\bneu\\s+khong.*(?:danh|dang|tung|noi)\\b","\\bkhong\\s+lam.*(?:danh|tung|dang)\\b"]);

  return {t,gambling,debt,onlineLoan,scam,privacy:(privacy||imagePosted),insult:(insult||appearanceTarget),rumor,threat,conflict,hacking,witness,
          selfBorrow,selfGamble,otherBorrowFromUser,otherGamble,directVictim,selfActor,imminent,selfHarm,mutualPlay,
          boundarySet,repeated,appearanceTarget,imagePosted,coercion};
}

function categoriesFrom(f){
  if(f.mutualPlay) return ["Tương tác/trêu đùa an toàn"];
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
  if(f.mutualPlay) return "Thấp";
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
  if(f.mutualPlay) return "Theo điều em kể, hai em đang trêu đùa với nhau và cả hai đều thấy vui, chưa có dấu hiệu ai bị ép buộc hay tổn thương. Cô sẽ giúp em nhận biết ranh giới để việc đùa vui vẫn an toàn và tôn trọng nhau.";
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
  if(f.mutualPlay){
    return [
      "Với thông tin hiện có, chưa đủ dấu hiệu để xem việc hai em trêu nhau là bắt nạt hay bạo lực học đường vì cả hai đều đang vui và không ai khó chịu.",
      "Hai em vẫn nên tôn trọng giới hạn của nhau: nếu một người nói dừng, tỏ ra khó chịu hoặc không muốn tiếp tục thì người kia cần dừng ngay.",
      "Không nên biến ngoại hình hoặc điểm nhạy cảm của nhau thành trò đùa kéo dài, nhất là trước đông người hoặc đưa lên mạng, vì lúc đó tác động có thể khác hẳn."
    ];
  }
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
  if(f.appearanceTarget && f.boundarySet && f.repeated){
    return [
      "Việc em đã nói rõ là mình không thích và yêu cầu dừng nhưng các bạn vẫn lặp lại cho thấy đây không còn là một trò đùa hai bên cùng vui. Em không cần phải cười theo hoặc chịu đựng để giữ hòa khí.",
      "Nếu thấy an toàn, em có thể nhắc lại một lần ngắn gọn và dứt khoát: ‘Mình đã nói mình không thích bị gọi như vậy. Các bạn hãy dừng lại.’ Sau đó không kéo dài tranh cãi trước đám đông.",
      "Ghi lại những lần sự việc tiếp tục xảy ra (thời điểm, nơi xảy ra, ai có mặt); nếu có tin nhắn/bài đăng thì chỉ lưu phần cần thiết làm bằng chứng, không phát tán lại.",
      "Không đáp trả bằng biệt danh, xúc phạm ngoại hình, đánh nhau hoặc đăng chuyện xấu của các bạn lên mạng, vì trả đũa có thể làm tình huống leo thang.",
      "Vì em đã yêu cầu dừng mà hành vi vẫn lặp lại, hãy nói với GVCN, giáo viên hoặc cha mẹ/người lớn em tin tưởng để họ hỗ trợ chấm dứt việc này; nếu có đe dọa hay bạo lực thể chất thì cần báo ngay."
    ];
  }
  if(f.imagePosted && f.insult){
    return [
      "Trước hết, em không cần chửi lại hay đăng ảnh của bạn để trả đũa. Hãy lưu lại bài đăng, tên tài khoản, thời gian và một vài ảnh chụp màn hình cần thiết trước khi nội dung bị xóa.",
      "Nếu em thấy an toàn khi liên hệ, hãy yêu cầu bạn gỡ ảnh và dừng việc chế giễu em; có thể nói ngắn gọn: ‘Mình không đồng ý bạn đăng ảnh và nói về mình như vậy. Bạn hãy gỡ ảnh và dừng lại.’",
      "Báo cáo bài đăng/tài khoản trên nền tảng và kiểm tra quyền riêng tư của tài khoản để hạn chế việc lấy thêm hình ảnh hoặc thông tin của em.",
      "Không lập tài khoản khác để công kích, đăng ảnh xấu/bí mật của bạn hoặc rủ người khác vào chửi lại; điều đó có thể làm sự việc nghiêm trọng hơn.",
      "Nếu bạn không gỡ, tiếp tục đăng/chế giễu, nhiều người cùng tham gia hoặc xuất hiện đe dọa, hãy đưa bằng chứng cho cha mẹ, GVCN/giáo viên hoặc người lớn em tin tưởng để cùng hỗ trợ xử lý."
    ];
  }
  if(f.otherBorrowFromUser && f.otherGamble){
    return [
      "Không cho bạn mượn thêm tiền, kể cả khi bạn nói cần tiền để “gỡ” số đã thua.",
      "Trao đổi bình tĩnh về đúng khoản tiền đã cho mượn và thống nhất thời gian/cách trả phù hợp.",
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
    steps.push("Trước tiên, đừng đôi co hoặc đăng nội dung để trả đũa. Nếu ảnh/video/thông tin của em đang bị đăng, hãy lưu lại phần cần thiết như tài khoản, bài đăng, thời gian hoặc đường dẫn để làm bằng chứng.");
    steps.push("Nếu em cảm thấy an toàn khi liên hệ, hãy yêu cầu người đăng dừng và gỡ nội dung, nói ngắn gọn rằng em không đồng ý việc sử dụng hoặc phát tán hình ảnh/thông tin của mình.");
    steps.push("Dùng chức năng báo cáo bài đăng/tài khoản và chặn tài khoản gây hại; đồng thời kiểm tra lại quyền riêng tư để hạn chế việc lấy thêm hình ảnh hoặc thông tin.");
    steps.push("Không lập tài khoản khác để chửi lại, đăng ảnh của người kia hoặc rủ bạn bè tấn công họ, vì việc trả đũa có thể làm xung đột nghiêm trọng hơn.");
    steps.push("Nếu nội dung không được gỡ, tiếp tục bị phát tán, xuất hiện tài khoản mới hoặc có đe dọa, hãy đưa bằng chứng cho cha mẹ, GVCN/giáo viên hoặc người lớn em tin tưởng để cùng hỗ trợ xử lý.");
  }
  if((f.insult || f.rumor) && !f.privacy){
    // Action Planner cho xúc phạm / nói xấu / cô lập: xử lý theo cấu trúc
    // hành vi + mức lặp lại + không đồng thuận + môi trường số, thay vì 2 câu mẫu.
    const socialExclusion = anyRx(f.t,["\\btay\\s+chay\\b","\\bco\\s+lap\\b","\\bkhong\\s+cho.*tham\\s+gia\\b","\\bloai.*khoi\\s+nhom\\b"]);
    const onlineHarm = anyRx(f.t,["\\btren\\s+mang\\b","\\bnhom\\s+chat\\b","\\bfacebook\\b","\\btiktok\\b","\\bzalo\\b","\\bdang\\s+bai\\b","\\bbinh\\s+luan\\b"]);
    steps.push(
      f.boundarySet
        ? "Em đã thể hiện rằng mình không đồng ý/không thoải mái, vì vậy em không cần tiếp tục chịu đựng hoặc cố cười cho qua. Nếu thấy an toàn, hãy nhắc lại ranh giới một lần ngắn gọn, rõ ràng rồi dừng tranh cãi."
        : "Không đáp trả bằng xúc phạm, bêu xấu hoặc kéo thêm người vào công kích. Nếu thấy an toàn, hãy nói ngắn gọn điều em muốn dừng lại và tránh tranh cãi công khai kéo dài."
    );
    if(onlineHarm || f.repeated || f.rumor){
      steps.push("Lưu lại phần thông tin cần thiết để làm rõ sự việc như bài đăng/tin nhắn, tài khoản, thời điểm hoặc những lần hành vi lặp lại; không phát tán lại nội dung gây tổn thương.");
    }
    if(onlineHarm){
      steps.push("Nếu nội dung đang ở trên mạng, dùng chức năng báo cáo/chặn khi phù hợp và kiểm tra quyền riêng tư; nếu là bài đăng hoặc bình luận về em, có thể yêu cầu gỡ nội dung khi việc liên hệ là an toàn.");
    } else if(socialExclusion){
      steps.push("Nếu em bị loại khỏi hoạt động học tập hoặc hoạt động chung của lớp, hãy ghi lại việc cụ thể em bị ngăn tham gia và trao đổi với GVCN/giáo viên phụ trách để bảo đảm em vẫn được tham gia phù hợp.");
    } else {
      steps.push("Tách sự việc cụ thể nào đang làm em tổn thương nhất (lời nói, tin đồn hay hành vi cô lập) để trình bày rõ với người hỗ trợ, thay vì cố tự giải quyết tất cả cùng lúc.");
    }
    steps.push("Không trả đũa bằng cách tung chuyện riêng, lập tài khoản khác để công kích, rủ bạn bè tẩy chay ngược hoặc hẹn đánh nhau; trả đũa có thể làm tình huống leo thang.");
    steps.push(
      socialExclusion
        ? "Vì sự việc có cả nói xấu/cô lập, hãy báo GVCN, giáo viên hoặc cha mẹ/người lớn em tin tưởng nếu hành vi tiếp diễn hoặc ảnh hưởng việc học, sinh hoạt của em; nếu có đe dọa hay nguy cơ bạo lực thì báo ngay."
        : "Nếu việc xúc phạm/nói xấu tiếp tục, có nhiều người tham gia, ảnh hưởng việc học hoặc làm em thấy không an toàn, hãy đưa thông tin đã lưu cho GVCN, giáo viên hoặc cha mẹ/người lớn em tin tưởng để cùng xử lý."
    );
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
  if((f.insult || f.rumor) && !f.privacy){
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
  const approved=approvedReply(text);
  if(approved) return approved;
  const relationship=relationshipResponse(text);
  if(relationship) return relationship;
  const meeting=meetingResponse(text);
  if(meeting) return meeting;
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
  const approved=approvedReply(text);
  if(approved) return approved;
  // Không ghi đè lời tư vấn Gemini có ngữ cảnh bằng mẫu tình cảm chung chung.
  const meeting=meetingResponse(text);
  if(meeting) return meeting; // An toàn nhất quán cả khi Gemini trả lời chung chung.
  const fb=fallback(text);
  const out={...fb,...obj};
  if(!out.support || typeof out.support!=="string") out.support=fb.support;
  const hardSafety = fb._diagnostics?.risk_level === "Rất cao";
  // Preserve genuine semantic reasoning from Gemini. The old version replaced any
  // answer with <4 steps by the generic rule fallback, which caused good contextual
  // reasoning to disappear. Only hard-safety cases force deterministic steps.
  if(hardSafety || !Array.isArray(out.safe_steps) || out.safe_steps.length===0) out.safe_steps=fb.safe_steps;
  out.safe_steps=uniq(out.safe_steps.map(String).filter(Boolean)).slice(0,6);

  // Quality gate: với tình huống thực sự cần hành động, nếu mô hình chỉ tạo 1-2
  // bước quá ngắn thì dùng Action Planner cấu trúc làm nền. Không áp dụng cho
  // trêu đùa an toàn hoặc trường hợp mà kế hoạch ngắn là phù hợp.
  const plannerHasDepth = Array.isArray(fb.safe_steps) && fb.safe_steps.length >= 4;
  const aiPlanTooThin = Array.isArray(out.safe_steps) && out.safe_steps.length < 3;
  if(!hardSafety && plannerHasDepth && aiPlanTooThin){
    out.safe_steps = fb.safe_steps;
  }
  if(!out.legal || typeof out.legal!=="object") out.legal=fb.legal;
  out.legal={
    user_side:String(out.legal.user_side||fb.legal.user_side),
    other_side:String(out.legal.other_side||fb.legal.other_side),
    note:String(out.legal.note||fb.legal.note)
  };
  if(!out.final_advice || typeof out.final_advice!=="string") out.final_advice=fb.final_advice;

  // Merge semantic diagnostics with deterministic safety. Do not erase Gemini's
  // actor/role analysis on open wording; deterministic rules remain authoritative
  // only for hard-safety escalation.
  const gd=(obj && typeof obj._diagnostics==="object") ? obj._diagnostics : {};
  out._diagnostics={...fb._diagnostics,...gd};
  if(hardSafety) out._diagnostics.risk_level=fb._diagnostics.risk_level;
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
if (!r.ok) {
  const detail = await r.json().catch(() => ({}));
  const reason = String(
    detail?.error?.message || "Không có mô tả lỗi"
  )
    .split(key).join("[ẨN KHÓA]")
    .replace(/AIza[\w-]+/g, "[ẨN KHÓA]");

  throw new Error(`Gemini HTTP ${r.status}: ${reason}`);
}
  const data=await r.json();
  const raw=data?.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("")||"";
  if(!raw) throw new Error("Gemini không trả nội dung");
  return JSON.parse(raw);
}

export function __testFallback(text){ return fallback(text); }
export function __testMeeting(text){ return meetingRisk(text); }
export function __testRelationship(text){ return relationshipContext(text); }
export function __testApproved(text){return approvedReply(text);}

export default async (request) => {
  if(request.method!=="POST"){
    return new Response(JSON.stringify({error:"Method not allowed"}),{status:405,headers:{"content-type":"application/json"}});
  }
  try{
    const payload=await request.json();
    if(typeof payload?.text!=="string" || payload.text.length>3000){
      return new Response(JSON.stringify({error:"Tình huống phải là văn bản không quá 3000 ký tự."}),{status:400,headers:{"content-type":"application/json"}});
    }
    const clean=payload.text.trim();
    if(!clean){
      return new Response(JSON.stringify({error:"Em hãy nhập tình huống cần chia sẻ."}),{status:400,headers:{"content-type":"application/json"}});
    }

    let result=null, engine="reasoning-rules-v1.5-school-violence";
    try{
      const ai=await askGemini(clean);
      if(ai){ result=normalizeGemini(ai,clean); engine="gemini-reasoning+safety-v1.5-school-violence"; }
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

