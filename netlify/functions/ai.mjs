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

const APPROVED_DEMO_CASES = [
  {
    "id": "TH001",
    "question": "Mấy bạn trong lớp cứ gọi em là 'heo' trong group lớp, em bảo đừng gọi nữa mà các bạn vẫn tag tên em để cười.",
    "support": "Cô hiểu em buồn và xấu hổ khi bị gọi bằng biệt danh về ngoại hình ngay trong nhóm lớp, nhất là em đã nói rõ mình không thích mà các bạn vẫn tiếp tục. Em có quyền được tôn trọng, và cảm giác khó chịu của em là điều cần được lắng nghe.",
    "steps": [
      "Em đừng tự trách mình hay cố cười cho qua. Hãy ngừng tranh cãi trong nhóm nếu việc đó chỉ khiến các bạn tiếp tục trêu chọc.",
      "Em có thể nhắn một lần, rõ ràng: “Mình không thích bị gọi như vậy. Mình đã nói rồi, mong các bạn dừng lại và không tag mình để chế giễu nữa.”",
      "Chụp lại những tin nhắn, lượt tag có liên quan, không phát tán lại để trả đũa. Nếu các bạn vẫn tiếp tục, hãy đưa bằng chứng cho giáo viên chủ nhiệm hoặc người lớn em tin tưởng để được hỗ trợ chấm dứt hành vi.",
      "Tìm đến những người bạn tôn trọng mình và giữ khoảng cách với nhóm đang trêu chọc; em không phải tự chịu đựng chuyện này."
    ],
    "ending": "Ngoại hình không quyết định giá trị của em. Việc đặt ranh giới và nhờ hỗ trợ khi bị trêu chọc lặp lại là cách tự bảo vệ mình, không phải mách lẻo."
  },
  {
    "id": "TH002",
    "question": "Em tức bạn A nên vào bài đăng của bạn ấy comment 'đồ ngu, xấu mà còn chảnh'. Giờ em vẫn muốn chửi tiếp.",
    "support": "Cô hiểu khi tức giận, em rất dễ muốn viết thêm những lời nặng nề để hả giận. Nhưng em đã bình luận xúc phạm ngoại hình và trí tuệ của bạn; nếu tiếp tục, em sẽ khiến bạn tổn thương hơn và mâu thuẫn cũng khó giải quyết hơn.",
    "steps": [
      "Dừng ngay việc bình luận hoặc nhắn tin xúc phạm. Đặt điện thoại xuống một lúc để cảm xúc dịu đi trước khi quyết định làm gì tiếp.",
      "Xóa bình luận xúc phạm do mình đăng nếu còn có thể, không chụp lại để khoe hoặc rủ người khác công kích bạn.",
      "Khi đã bình tĩnh, em có thể nói: “Mình đã bình luận quá đáng. Mình xin lỗi vì đã xúc phạm bạn. Nếu có chuyện bất đồng, mình muốn trao đổi về việc đó chứ không công kích cá nhân.”",
      "Nếu giữa hai em có mâu thuẫn thật sự, hãy nói về hành vi cụ thể khiến em khó chịu; nhờ thầy cô hòa giải nếu hai bên không thể trao đổi tôn trọng."
    ],
    "ending": "Biết dừng lại và sửa một lời nói sai là dấu hiệu của sự trưởng thành. Em có thể không đồng ý với bạn mà vẫn giữ được sự tử tế."
  },
  {
    "id": "TH011",
    "question": "Bạn chụp lúc em ngủ gật rồi đăng group lớp làm meme, em bảo xóa mà bạn không xóa.",
    "support": "Cô hiểu em rất ngại khi hình ảnh mình ngủ gật bị biến thành trò cười trong nhóm lớp. Điều làm cô lo hơn là em đã yêu cầu gỡ mà bạn vẫn không tôn trọng. Em không cần chịu đựng việc hình ảnh của mình bị sử dụng theo cách khiến mình tổn thương.",
    "steps": [
      "Em hãy nhắn rõ ràng, tránh đôi co: “Mình không đồng ý để ảnh của mình làm meme. Bạn hãy xóa ảnh và dừng chia sẻ nhé.”",
      "Lưu lại ảnh chụp màn hình bài đăng, tên nhóm và tin nhắn em yêu cầu gỡ; chỉ chia sẻ bằng chứng với người có trách nhiệm hỗ trợ.",
      "Nhờ giáo viên chủ nhiệm hoặc quản trị nhóm yêu cầu gỡ nội dung và ngăn đăng lại. Nếu ảnh đã lan rộng, báo cáo nội dung trên nền tảng khi có thể.",
      "Không đăng ảnh xấu của bạn để trả đũa. Nếu em thấy ngại đến lớp hoặc bị chế giễu kéo dài, hãy nói với người lớn đáng tin để được hỗ trợ tâm lý và xử lý trong lớp."
    ],
    "ending": "Một khoảnh khắc vô tình không phải lý do để người khác làm em xấu hổ. Em xứng đáng được bảo vệ hình ảnh và sự riêng tư của mình."
  },
  {
    "id": "TH022",
    "question": "Em bịa chuyện bạn A gian lận thi rồi đăng confession vì em ghét bạn.",
    "support": "Cô hiểu em đang rất ghét bạn A, nhưng việc bịa chuyện bạn gian lận thi rồi đăng confession có thể gây tổn thương lớn cho danh dự và việc học của bạn. Cô muốn giúp em sửa việc này trước khi hậu quả lan rộng, chứ không chỉ trách mắng em.",
    "steps": [
      "Dừng ngay việc đăng thêm hoặc bình luận cổ vũ tin đồn. Xóa hoặc đề nghị quản trị confession gỡ bài bịa đặt càng sớm càng tốt.",
      "Đính chính rõ rằng thông tin em đăng không có căn cứ; không đổ lỗi cho người khác. Em có thể nói: “Mình đã đăng thông tin sai về bạn A. Mình xin đính chính và xin lỗi vì đã gây ảnh hưởng đến bạn.”",
      "Nếu bài đã lan trong trường, hãy chủ động trao đổi với giáo viên chủ nhiệm để được hướng dẫn khắc phục, tránh để bạn A tiếp tục bị hiểu lầm.",
      "Sau khi xử lý hậu quả, hãy nhìn lại điều khiến em tức giận với A và tìm cách giải quyết bất đồng mà không dùng tin giả hoặc bêu xấu."
    ],
    "ending": "Một lời đính chính kịp thời có thể giúp giảm tổn thương cho người khác. Cô tin em có thể chịu trách nhiệm và chọn cách ứng xử tốt hơn từ đây."
  },
  {
    "id": "TH031",
    "question": "Bạn nhắn 'mai ra cổng trường tao xử mày'. Em sợ thật.",
    "support": "Cô hiểu vì sao em sợ: câu “mai ra cổng trường tao xử mày” là lời đe dọa cụ thể về thời điểm và địa điểm, không nên xem như một câu trêu đùa thông thường. Điều quan trọng nhất lúc này là bảo đảm em không phải đối mặt một mình.",
    "steps": [
      "Ngay hôm nay, hãy báo cho cha mẹ, giáo viên chủ nhiệm hoặc ban giám hiệu biết nguyên văn lời đe dọa và thời điểm “mai ra cổng trường”. Đưa tin nhắn cho người lớn xem.",
      "Ngày mai không tự ra cổng trường gặp bạn, không nhận lời “giải quyết riêng” và không rủ nhóm bạn đi đối đầu. Hãy nhờ thầy cô hoặc cha mẹ bố trí người đón, đưa em đến nơi an toàn.",
      "Lưu tin nhắn đe dọa, không xóa hay đáp trả bằng lời thách thức. Nếu bạn tiếp tục đe dọa, hãy cập nhật ngay cho người lớn đang hỗ trợ.",
      "Nếu bạn hoặc nhóm bạn xuất hiện để hành hung, hãy tránh tiếp cận, đến ngay nơi có thầy cô/bảo vệ/người lớn; khi có nguy hiểm trực tiếp, yêu cầu hỗ trợ khẩn cấp."
    ],
    "ending": "Em không phải chứng minh mình dũng cảm bằng cách ra gặp người đe dọa. Báo người lớn sớm là lựa chọn có trách nhiệm và giúp ngăn bạo lực trước khi xảy ra."
  },
  {
    "id": "TH042",
    "question": "Em chia tay bạn trai, bạn ấy cứ nhắn hàng chục tin bắt em quay lại.",
    "support": "Cô hiểu việc đã chia tay mà vẫn liên tục nhận hàng chục tin nhắn đòi quay lại có thể khiến em mệt mỏi, áp lực, thậm chí thấy có lỗi. Nhưng em có quyền kết thúc một mối quan hệ; không ai được buộc em thay đổi quyết định bằng cách nhắn tin dồn dập.",
    "steps": [
      "Nếu thấy an toàn, em có thể trả lời một lần, ngắn gọn: “Mình đã suy nghĩ kỹ và không muốn quay lại. Mong bạn tôn trọng quyết định của mình và dừng nhắn tin liên tục.”",
      "Sau đó không cần tranh luận từng tin nhắn. Có thể tắt thông báo, giới hạn liên hệ hoặc chặn nếu bạn tiếp tục quấy rối; lưu lại các tin nhắn gây áp lực khi cần.",
      "Đừng nhận lời gặp riêng chỉ vì sợ bạn buồn hoặc giận. Nếu cần trao đổi việc còn dang dở, hãy chọn cách an toàn và có người đáng tin biết.",
      "Nếu bạn đe dọa, theo dõi, ép gặp hoặc dọa tự làm hại bản thân, hãy báo ngay cho người lớn có trách nhiệm để hỗ trợ; em không phải tự giải quyết những nguy cơ ấy."
    ],
    "ending": "Một lời từ chối rõ ràng không phải là sự tàn nhẫn. Tình cảm chỉ có ý nghĩa khi cả hai được tự nguyện và tôn trọng."
  },
  {
    "id": "TH056",
    "question": "B nợ em 200k, em nói nếu không trả em sẽ tung đoạn chat B từng nói xấu người khác.",
    "support": "Cô hiểu em bực vì B còn nợ 200 nghìn đồng, nhất là khi em có thể đang cần khoản tiền đó. Nhưng dùng đoạn chat riêng để đe dọa tung lên mạng sẽ khiến em từ người đòi quyền lợi chính đáng trở thành người gây tổn thương cho người khác.",
    "steps": [
      "Dừng lời đe dọa phát tán tin nhắn riêng, không đăng hoặc gửi đoạn chat cho người ngoài cuộc.",
      "Trao đổi thẳng vào khoản nợ: “Bạn còn nợ mình 200 nghìn. Bạn có thể cho mình biết khi nào trả được không? Nếu khó khăn, mình muốn hai bên thống nhất thời hạn cụ thể.”",
      "Giữ lại bằng chứng về việc cho mượn và các lần hẹn trả tiền, chỉ dùng để trao đổi với người có trách nhiệm khi cần.",
      "Nếu B tiếp tục né tránh, hãy nhờ phụ huynh hoặc giáo viên hỗ trợ trao đổi phù hợp; không dùng bêu xấu hay đe dọa để ép trả."
    ],
    "ending": "Đòi lại tiền là nhu cầu chính đáng, nhưng cách đòi cũng cần tôn trọng quyền riêng tư. Em sẽ có lợi hơn khi xử lý rõ ràng, bình tĩnh và có bằng chứng."
  },
  {
    "id": "TH065",
    "question": "Em chơi thử một lần 20k rồi thắng, giờ em muốn chơi tiếp để kiếm tiền tiêu.",
    "support": "Cô hiểu cảm giác vui và phấn khích khi chỉ chơi 20 nghìn đồng mà lại thắng. Chính cảm giác “mình có thể kiếm tiền dễ dàng” khiến trò chơi ăn tiền rất dễ cuốn người ta chơi tiếp. Nhưng thắng một lần không có nghĩa em sẽ tiếp tục thắng; càng chơi lâu, em càng có nguy cơ mất tiền và khó dừng lại.",
    "steps": [
      "Cô khuyên em dừng ngay hôm nay, không nạp thêm tiền và không xem đây là cách kiếm tiền tiêu vặt. Tiền thắng được không bảo đảm lần sau sẽ có lãi.",
      "Thoát khỏi trò chơi, tắt thông báo, rời các nhóm rủ rê đánh bạc và xóa phương thức thanh toán đã lưu nếu có. Đừng thử “thêm một ván” để kiểm chứng vận may.",
      "Nếu em đã dùng tiền học, tiền gia đình hoặc thấy khó cưỡng lại ý muốn chơi, hãy nói thật với cha mẹ hoặc một người lớn em tin tưởng để được giúp kiểm soát tiền và thời gian sử dụng điện thoại.",
      "Muốn có tiền tiêu vặt, em có thể cùng gia đình thống nhất khoản chi phù hợp hoặc chọn hoạt động kiếm tiền hợp pháp, phù hợp lứa tuổi; không vay mượn để chơi hoặc gỡ thua."
    ],
    "ending": "Điều đáng quý không phải là thắng được 20 nghìn, mà là biết dừng khi mình còn làm chủ được quyết định. Cô mong em giữ tiền và sự bình yên cho mình."
  },
  {
    "id": "TH075",
    "question": "Bạn bảo em chuyển 200k phí trước để được vay 5 triệu, em có nên chuyển không?",
    "support": "Cô mừng vì em đã hỏi trước khi chuyển 200 nghìn đồng. Lời hứa “nộp phí trước để vay 5 triệu” là dấu hiệu rất đáng nghi của lừa đảo vay tiền. Với học sinh, khoản vay như vậy còn có thể tạo áp lực nợ nần lớn hơn nhiều so với số tiền ban đầu.",
    "steps": [
      "Đừng chuyển 200 nghìn đồng, dù người kia nói đó là phí hồ sơ, phí xác minh hay hứa hoàn lại sau.",
      "Không gửi CCCD, ảnh chân dung, số tài khoản, mật khẩu hoặc mã OTP cho người mời vay. Không bấm liên kết lạ hoặc cài ứng dụng họ yêu cầu.",
      "Lưu lại tin nhắn, tên tài khoản và thông tin chuyển tiền họ cung cấp; nhờ cha mẹ hoặc người lớn đáng tin kiểm tra cùng em.",
      "Nếu em đã lỡ chuyển tiền hoặc cung cấp thông tin, báo ngay cho ngân hàng qua kênh chính thức và người lớn hỗ trợ để tìm cách bảo vệ tài khoản, đồng thời trình báo khi cần."
    ],
    "ending": "Việc em dừng lại để hỏi trước khi chuyển tiền là rất đúng. Một khoản vay đáng tin cậy không thể chỉ dựa vào lời hứa trên tin nhắn."
  },
  {
    "id": "TH090",
    "question": "Em thấy bạn thường xuyên đăng status rất tuyệt vọng sau khi bị bắt nạt. Em lo nhưng sợ nói ra bạn giận.",
    "support": "Cô cảm nhận được em rất quan tâm đến bạn. Thấy bạn thường xuyên đăng những dòng tuyệt vọng sau khi bị bắt nạt mà không biết phải làm gì thật sự là chuyện khó. Em lo bạn giận nếu mình nói với người lớn, nhưng khi có dấu hiệu tuyệt vọng kéo dài, sự an toàn của bạn quan trọng hơn việc giữ kín hoàn toàn.",
    "steps": [
      "Hãy liên hệ với bạn một cách nhẹ nhàng và riêng tư, chẳng hạn: “Mình thấy bạn đang rất buồn. Mình quan tâm đến bạn và muốn bạn được an toàn.” Lắng nghe, không trách móc hay xem nhẹ cảm xúc của bạn.",
      "Đừng hứa giữ bí mật nếu bạn có dấu hiệu muốn tự làm hại mình. Hãy báo sớm cho giáo viên, phụ huynh của bạn hoặc một người lớn có khả năng hỗ trợ, kể cả khi em sợ bạn giận.",
      "Nếu bài đăng có ý định tự tử, lời tạm biệt, kế hoạch tự hại hoặc bạn không phản hồi trong hoàn cảnh đáng lo, cần tìm người lớn can thiệp ngay; nếu nguy hiểm cấp bách, liên hệ dịch vụ cấp cứu tại địa phương.",
      "Không chia sẻ công khai ảnh chụp status hay biến câu chuyện thành chủ đề bàn tán. Em cũng có thể nhờ người lớn hỗ trợ chính mình nếu thấy quá lo lắng."
    ],
    "ending": "Giúp bạn không có nghĩa là em phải tự gánh mọi chuyện. Việc tìm người lớn đáng tin để bảo vệ bạn là một hành động quan tâm và dũng cảm."
  }
];
function approvedDemoReply(text){
 const t=norm(text);
 const item=APPROVED_DEMO_CASES.find(x=>norm(x.question)===t);
 if(!item)return null;
 return {
  support:item.support,
  safe_steps:item.steps,
  legal:{
   user_side:item.id==='TH002'||item.id==='TH022'||item.id==='TH056'?'Nếu chính em xúc phạm, tung tin sai hoặc đe dọa phát tán nội dung riêng tư, em cần dừng và khắc phục hành vi; trách nhiệm pháp lý cụ thể phải căn cứ tình tiết và độ tuổi.':'Từ lời kể hiện có, không có cơ sở kết luận em vi phạm pháp luật. Em có quyền được bảo vệ và cần ứng xử an toàn.',
   other_side:item.id==='TH075'?'Yêu cầu chuyển phí trước khi giải ngân là dấu hiệu đáng nghi của hành vi lừa đảo; không thể kết luận tội danh chỉ từ một tin nhắn.':item.id==='TH065'?'Việc tổ chức hoặc tham gia đánh bạc ăn tiền có thể liên quan quy định pháp luật, tùy hình thức và tình tiết; không nên xem là trò kiếm tiền an toàn.':item.id==='TH090'?'Cần đánh giá hành vi bắt nạt cụ thể; ưu tiên bảo vệ sức khỏe tinh thần và an toàn của bạn.':'Hành vi xúc phạm, đe dọa, phát tán hình ảnh hoặc thông tin riêng tư có thể xâm phạm quyền của người khác; cần xem xét sự việc cụ thể.',
   note:'Đây là định hướng giáo dục và an toàn, không phải kết luận vi phạm hay tư vấn pháp lý chuyên môn.'
  },
  final_advice:item.ending,
  _diagnostics:{situation_summary:item.question,user_role:'Học sinh trong tình huống mẫu',actor_analysis:'Phân tích theo vai trò nêu trong lời kể, không suy đoán.',categories:['Tình huống mẫu '+item.id],risk_level:['TH031','TH090'].includes(item.id)?'Cao':'Trung bình',need_clarification:false,clarifying_question:''},
  _reference_case:item.id
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


// 100 tình huống giáo viên đã rà soát từ bản Word; ưu tiên trùng khớp nội dung.
const REVIEWED_100 = [
 {
  "id": "DEV001",
  "question": "tụi bạn cứ kêu em là heo vì em mập, e nói đừng gọi nữa mà tụi nó vẫn gọi mỗi ngày. e nên lm sao",
  "assessment": "Bạn bị gọi biệt danh xúc phạm lặp lại dù đã phản đối.",
  "advice": "Cô biết nghe một biệt danh khiến em tổn thương mỗi ngày rất mệt mỏi. Em đã nói dừng mà các bạn vẫn tiếp tục, nên đây không còn là trò đùa vui với em. Em hãy ghi lại những lần xảy ra, nhờ giáo viên chủ nhiệm trao đổi và bảo vệ em; đừng cố chịu đựng một mình.",
  "legal": "Quyền được tôn trọng danh dự, nhân phẩm; cần xem xét bối cảnh và mức độ."
 },
 {
  "id": "DEV002",
  "question": "Bạn em hay lấy chiều cao của em ra chọc trước lớp, lúc đầu e cười nhưng giờ e thấy khó chịu lắm.",
  "assessment": "Bạn bị chọc chiều cao trước lớp, ranh giới đã thay đổi.",
  "advice": "Lúc đầu em cười không có nghĩa là em phải chấp nhận mãi, em nhé. Em có thể nói riêng: “Trước đây mình thấy vui, nhưng bây giờ mình khó chịu, bạn dừng nhé.” Nếu bạn vẫn trêu trước lớp, nhờ cô chủ nhiệm hỗ trợ để em không phải đối mặt một mình.",
  "legal": "Quyền được tôn trọng danh dự, nhân phẩm; cần xem xét bối cảnh và mức độ."
 },
 {
  "id": "DEV003",
  "question": "Trong gr lớp có mấy bạn cứ gọi em là “đồ ngu”, em ko trả lời thì tụi nó càng tag tên em.",
  "assessment": "Bạn bị xúc phạm và liên tục gắn thẻ trong nhóm lớp.",
  "advice": "Cô hiểu bị gọi “đồ ngu” rồi liên tục bị tag tên khiến em ngại mở nhóm. Em đừng đôi co trong nhóm; hãy chụp lại các tin nhắn, tắt thông báo nếu cần và báo quản trị nhóm cùng giáo viên chủ nhiệm để yêu cầu dừng hành vi.",
  "legal": "Quyền được tôn trọng danh dự, nhân phẩm; cần xem xét bối cảnh và mức độ."
 },
 {
  "id": "DEV004",
  "question": "Bạn thân hay trêu mũi em xấu, cả 2 vẫn cười vui. Vậy có phải bắt nạt ko ạ?",
  "assessment": "Trêu đùa có vẻ được cả hai đồng thuận, chưa đủ căn cứ kết luận bắt nạt.",
  "advice": "Nếu cả hai thật sự cùng vui, không ai bị ép cười và khi nói “dừng” thì người kia tôn trọng, chưa đủ cơ sở gọi đó là bắt nạt. Nhưng em có quyền đổi ý bất cứ lúc nào. Nếu một ngày em thấy buồn, hãy nói thẳng với bạn; cô mong tình bạn ấy biết tôn trọng giới hạn của nhau.",
  "legal": "Quyền được tôn trọng danh dự, nhân phẩm; cần xem xét bối cảnh và mức độ."
 },
 {
  "id": "DEV005",
  "question": "Em lỡ nói bạn là “đồ béo” trước lớp, giờ bạn giận và ko nói chuyện với em. Em phải làm gì để sửa ạ?",
  "assessment": "Người hỏi đã xúc phạm bạn và muốn sửa sai.",
  "advice": "Em đã nhận ra câu “đồ béo” làm bạn tổn thương, đó là bước đầu đáng quý. Em hãy xin lỗi cụ thể, không nói “chỉ đùa thôi”, và hỏi bạn cần gì để thấy được tôn trọng. Sau đó cho bạn thời gian; đừng ép bạn phải tha thứ ngay.",
  "legal": "Quyền được tôn trọng danh dự, nhân phẩm; cần xem xét bối cảnh và mức độ."
 },
 {
  "id": "DEV006",
  "question": "Mấy bạn cứ bắt chước giọng nói của em rồi cười, e nói ko thích nhưng vẫn làm.",
  "assessment": "Bạn bị bắt chước giọng nói sau khi yêu cầu dừng.",
  "advice": "Giọng nói là một phần riêng của em và không đáng bị đem ra làm trò cười. Vì em đã nói không thích mà các bạn vẫn làm, hãy ghi lại sự việc và nhờ giáo viên can thiệp. Nếu em muốn, cô có thể giúp em tập một câu nói ngắn, rõ ràng để đặt giới hạn.",
  "legal": "Quyền được tôn trọng danh dự, nhân phẩm; cần xem xét bối cảnh và mức độ."
 },
 {
  "id": "DEV007",
  "question": "Có bạn bình luận dưới ảnh em “nhìn như con khỉ”, nhiều người thả haha. Em có nên chửi lại ko?",
  "assessment": "Bạn bị bình luận miệt thị trên ảnh và muốn trả đũa.",
  "advice": "Cô hiểu em tức khi bị bình luận xúc phạm và nhiều người hùa theo. Nhưng chửi lại dễ khiến em bị cuốn vào một cuộc công kích mới. Em hãy lưu ảnh màn hình, ẩn hoặc báo cáo bình luận, chặn người quấy rối và nhờ người lớn hỗ trợ nếu việc này kéo dài.",
  "legal": "Quyền được tôn trọng danh dự, nhân phẩm; cần xem xét bối cảnh và mức độ."
 },
 {
  "id": "DEV008",
  "question": "Bạn trong lớp hay nói em học dốt, vô dụng, chỉ nói lúc ko có giáo viên. e thấy ngại đi học.",
  "assessment": "Bạn bị hạ thấp năng lực khi vắng giáo viên, ngại đi học.",
  "advice": "Nghe những lời “vô dụng” lặp lại có thể khiến em mất tự tin, nhưng chúng không nói lên giá trị của em. Vì em đã ngại đến trường, cô muốn em sớm chia sẻ với giáo viên chủ nhiệm hoặc người lớn em tin tưởng, kể rõ lúc nào và ai có mặt để được hỗ trợ.",
  "legal": "Quyền được tôn trọng danh dự, nhân phẩm; cần xem xét bối cảnh và mức độ."
 },
 {
  "id": "DEV009",
  "question": "Tụi em hay gọi biệt danh nhau cho vui, nhưng hôm nay bạn bảo em dừng. Em có cần xin lỗi ko?",
  "assessment": "Người hỏi dùng biệt danh và bạn đã yêu cầu dừng.",
  "advice": "Có chứ em, khi bạn nói dừng thì điều cần làm là tôn trọng ngay. Em hãy xin lỗi vì đã khiến bạn khó chịu, ngừng dùng biệt danh ấy và nhắc các bạn khác đừng tiếp tục. Một lời xin lỗi có ý nghĩa khi hành động của mình thay đổi.",
  "legal": "Quyền được tôn trọng danh dự, nhân phẩm; cần xem xét bối cảnh và mức độ."
 },
 {
  "id": "DEV010",
  "question": "Bạn cứ đem hoàn cảnh gia đình em ra chế giễu trên mạng. Em rất tức và muốn đăng chuyện xấu của bạn lại.",
  "assessment": "Bạn bị chế giễu hoàn cảnh gia đình, đang định trả đũa.",
  "advice": "Cô hiểu em đau lòng và tức giận khi chuyện gia đình bị đem ra chế giễu. Nhưng đăng chuyện xấu của bạn để trả đũa sẽ làm cả hai tổn thương thêm. Em hãy lưu bằng chứng, hạn chế tranh cãi trên mạng và nhờ giáo viên cùng người lớn đáng tin cậy giúp chấm dứt việc xúc phạm.",
  "legal": "Quyền được tôn trọng danh dự, nhân phẩm; cần xem xét bối cảnh và mức độ."
 },
 {
  "id": "DEV011",
  "question": "Nhóm bạn trong lớp tự nhiên ko cho em ngồi chung và nói mọi người đừng chơi với em.",
  "assessment": "Bạn bị vận động cô lập trong lớp.",
  "advice": "Bị ngăn không cho ngồi hay chơi cùng khiến em dễ cảm thấy mình bị bỏ rơi. Em không cần van xin cả nhóm chấp nhận mình. Hãy kể cụ thể với giáo viên chủ nhiệm, tìm một bạn an toàn để đồng hành và nhờ cô hỗ trợ xây dựng lại cách ứng xử trong lớp.",
  "legal": "Quyền được tôn trọng danh dự, nhân phẩm; cần xem xét bối cảnh và mức độ."
 },
 {
  "id": "DEV012",
  "question": "Mấy bạn kick em khỏi gr làm bài rồi vẫn ghi tên em là ko làm gì. e phải sao ạ",
  "assessment": "Bạn bị loại khỏi nhóm học và bị quy trách nhiệm không làm bài.",
  "advice": "Đây không chỉ là chuyện bạn bè mà còn ảnh hưởng quyền tham gia học tập của em. Em hãy giữ lịch sử nhóm, phần bài mình đã làm và trao đổi sớm với giáo viên bộ môn để được đánh giá công bằng; đồng thời đề nghị cô giúp nhóm phân công minh bạch.",
  "legal": "Quyền được tôn trọng danh dự, nhân phẩm; cần xem xét bối cảnh và mức độ."
 },
 {
  "id": "DEV013",
  "question": "Bạn A bảo ai nói chuyện với em thì A sẽ nghỉ chơi người đó, giờ gần như ko ai nói với em.",
  "assessment": "Bạn bị đe dọa cô lập qua sức ép với bạn khác.",
  "advice": "Khi một người dọa nghỉ chơi bất kỳ ai nói chuyện với em, đó là cách gây sức ép lên cả nhóm. Cô mong em đừng tự trách mình. Em hãy chia sẻ với giáo viên chủ nhiệm, nói rõ lời đe dọa và nhờ cô bảo vệ những bạn muốn đối xử tử tế với em.",
  "legal": "Quyền được tôn trọng danh dự, nhân phẩm; cần xem xét bối cảnh và mức độ."
 },
 {
  "id": "DEV014",
  "question": "Em bị mấy bạn tẩy chay nhưng ko ai chửi hay đánh em, vậy có tính là bạo lực học đường ko?",
  "assessment": "Bạn hỏi liệu tẩy chay không đánh chửi có là bạo lực.",
  "advice": "Cô hiểu việc nhiều bạn tránh chơi khiến em buồn và hoang mang. Nếu có người cố ý lôi kéo cả nhóm tẩy chay em, nhất là khi việc này lặp lại và ảnh hưởng đến học tập, đó có thể là bắt nạt bằng cách cô lập. Em hãy ghi lại các sự việc cụ thể và nhờ giáo viên chủ nhiệm hoặc người lớn em tin tưởng hỗ trợ. Cô sẽ không vội kết luận khi chưa biết đầy đủ câu chuyện.",
  "legal": "Quyền được tôn trọng danh dự, nhân phẩm; cần xem xét bối cảnh và mức độ."
 },
 {
  "id": "DEV015",
  "question": "Nhóm em cố tình ko báo lịch làm bài nhóm cho em, đến lúc nộp lại nói em ko tham gia.",
  "assessment": "Bạn bị giấu lịch làm nhóm rồi đổ lỗi.",
  "advice": "Em hãy tập hợp các tin nhắn, thời điểm mình hỏi lịch và phần việc đã thực hiện, rồi trao đổi riêng với giáo viên bộ môn trước khi chấm điểm. Cô hiểu cảm giác bị đổ lỗi rất ấm ức, nhưng đưa thông tin rõ ràng sẽ hiệu quả hơn tranh cãi với cả nhóm.",
  "legal": "Quyền được tôn trọng danh dự, nhân phẩm; cần xem xét bối cảnh và mức độ."
 },
 {
  "id": "DEV016",
  "question": "Em giận một bạn nên em rủ mấy đứa khác đừng chơi với bạn đó nữa. Giờ em thấy mình làm quá, sửa sao ạ?",
  "assessment": "Người hỏi chủ động rủ tẩy chay bạn, muốn sửa.",
  "advice": "Em đã thấy việc rủ người khác nghỉ chơi có thể khiến bạn bị cô lập. Hãy dừng lời kêu gọi đó, nói với nhóm rằng mỗi người có quyền tự quyết định kết bạn và xin lỗi người bị ảnh hưởng. Nếu bạn chưa muốn nói chuyện, em hãy tôn trọng và chứng minh bằng hành động.",
  "legal": "Quyền được tôn trọng danh dự, nhân phẩm; cần xem xét bối cảnh và mức độ."
 },
 {
  "id": "DEV017",
  "question": "Bạn em bị cả lớp né tránh sau một tin đồn. Em muốn chơi với bạn nhưng sợ mình cũng bị tẩy chay.",
  "assessment": "Người chứng kiến sợ bị tẩy chay nếu giúp bạn.",
  "advice": "Cô hiểu em sợ bị kéo vào chuyện. Em không cần đối đầu với cả lớp để giúp bạn: chỉ cần hỏi thăm riêng, ngồi cạnh bạn khi an toàn và cùng bạn tìm giáo viên đáng tin cậy. Đừng lan truyền tin đồn; một sự đồng hành kín đáo cũng rất có ý nghĩa.",
  "legal": "Quyền được tôn trọng danh dự, nhân phẩm; cần xem xét bối cảnh và mức độ."
 },
 {
  "id": "DEV018",
  "question": "Tụi nó lập gr riêng để nói xấu em rồi chụp hình gửi cho em xem.",
  "assessment": "Bạn bị lập nhóm nói xấu rồi cố ý gửi ảnh chụp.",
  "advice": "Việc họ chụp lời nói xấu gửi cho em có thể nhằm làm em tổn thương. Em đừng phản công trong nhóm; hãy lưu những ảnh chụp đó, chặn liên hệ quấy rối nếu cần và báo giáo viên chủ nhiệm. Cô muốn em có người đứng cùng, không phải tự chịu đựng.",
  "legal": "Quyền được tôn trọng danh dự, nhân phẩm; cần xem xét bối cảnh và mức độ."
 },
 {
  "id": "DEV019",
  "question": "Trong giờ thể dục mấy bạn cố tình ko chọn em vào đội, còn nói “đừng cho nó vào”. Việc này xảy ra hoài.",
  "assessment": "Bạn bị loại khỏi đội thể dục lặp lại và chế giễu.",
  "advice": "Trong hoạt động thể dục, việc cố tình loại em và nói lời hạ thấp nhiều lần cần được giáo viên biết. Em hãy trao đổi với giáo viên thể dục về những lần xảy ra và đề nghị cách chia đội công bằng. Em xứng đáng được tham gia học tập, không phải chịu chế giễu.",
  "legal": "Quyền được tôn trọng danh dự, nhân phẩm; cần xem xét bối cảnh và mức độ."
 },
 {
  "id": "DEV020",
  "question": "Em và bạn cãi nhau, sau đó bạn kêu mọi người block em hết. Em nên nói với ai?",
  "assessment": "Bạn bị kêu gọi chặn liên lạc sau tranh cãi.",
  "advice": "Một cuộc cãi nhau không nên biến thành việc cả nhóm cô lập em. Em có thể ngừng nhắn khi đang nóng giận, lưu những tin nhắn kích động tẩy chay và nhờ giáo viên chủ nhiệm giúp hòa giải trong điều kiện an toàn. Không cần tìm cách nhắn liên tục cho người đã chặn em.",
  "legal": "Quyền được tôn trọng danh dự, nhân phẩm; cần xem xét bối cảnh và mức độ."
 },
 {
  "id": "DEV021",
  "question": "Có người tung tin em ăn cắp tiền trong lớp nhưng em ko làm. Tin lan qua mấy lớp rồi.",
  "assessment": "Bạn bị vu cáo ăn cắp và tin đồn lan rộng.",
  "advice": "Bị gán chuyện ăn cắp khi em không làm là rất nghiêm trọng với danh dự của em. Em hãy báo ngay giáo viên chủ nhiệm và gia đình, cung cấp những gì em biết về nguồn tin, đề nghị nhà trường xác minh và đính chính phù hợp. Đừng tự đi chất vấn từng người trong lúc tức giận.",
  "legal": "Quyền được tôn trọng danh dự, nhân phẩm; cần xem xét bối cảnh và mức độ."
 },
 {
  "id": "DEV022",
  "question": "Bạn nói trên story là em sống giả tạo dù ko ghi tên, nhưng ai cũng biết đang nói em.",
  "assessment": "Bạn bị nói bóng gió trên story, chưa nêu đích danh.",
  "advice": "Cô hiểu em thấy bị nhắm tới dù story không ghi tên. Trước khi phản ứng, em hãy lưu nội dung và xem có dấu hiệu rõ ràng nào cho thấy đang nói về mình không. Nếu ảnh hưởng đến em, hãy trao đổi bình tĩnh hoặc nhờ người lớn hỗ trợ, tránh đăng story đáp trả khiến hiểu lầm lớn hơn.",
  "legal": "Quyền được tôn trọng danh dự, nhân phẩm; cần xem xét bối cảnh và mức độ."
 },
 {
  "id": "DEV023",
  "question": "Có nick ảo lấy tên em đi nhắn tin chửi người khác, giờ mọi người tưởng là em.",
  "assessment": "Có tài khoản giả danh người hỏi để xúc phạm người khác.",
  "advice": "Em nên chụp lại trang giả mạo, đường dẫn và các tin nhắn liên quan; báo cáo tài khoản mạo danh với nền tảng. Hãy nói sớm với giáo viên, gia đình và những người bị nhắn tin rằng đó không phải tài khoản của em, đồng thời kiểm tra bảo mật tài khoản thật.",
  "legal": "Quyền được tôn trọng danh dự, nhân phẩm; cần xem xét bối cảnh và mức độ."
 },
 {
  "id": "DEV024",
  "question": "Bạn kể chuyện riêng của em sai sự thật rồi gửi vào gr lớp. Em giải thích càng nhiều càng rối.",
  "assessment": "Bạn bị kể sai chuyện riêng và càng giải thích càng rối.",
  "advice": "Em không cần trả lời từng bình luận trong nhóm lớp. Hãy lưu tin nhắn, viết ngắn gọn điều gì sai sự thật và nhờ giáo viên chủ nhiệm hỗ trợ làm rõ trong phạm vi cần thiết. Cô hiểu em muốn giải thích ngay, nhưng cách bình tĩnh, có người hỗ trợ sẽ bảo vệ em tốt hơn.",
  "legal": "Quyền được tôn trọng danh dự, nhân phẩm; cần xem xét bối cảnh và mức độ."
 },
 {
  "id": "DEV025",
  "question": "Em lỡ kể một chuyện chưa kiểm chứng về bạn cho mấy người khác, giờ mới biết là sai. Em nên làm gì?",
  "assessment": "Người hỏi đã truyền tin chưa kiểm chứng và muốn sửa.",
  "advice": "Em hãy dừng kể lại ngay, liên hệ những người mình đã nói để đính chính rằng thông tin chưa đúng và xin lỗi bạn bị ảnh hưởng. Đừng biện minh bằng câu “em chỉ nghe người khác nói”. Cô tin việc chủ động sửa sai sẽ giúp hạn chế tin đồn lan tiếp.",
  "legal": "Quyền được tôn trọng danh dự, nhân phẩm; cần xem xét bối cảnh và mức độ."
 },
 {
  "id": "DEV026",
  "question": "Mấy bạn ghép ảnh em với câu nói em chưa từng nói rồi đăng lên mạng.",
  "assessment": "Bạn bị ghép ảnh với lời nói giả.",
  "advice": "Đây là nội dung bị chỉnh sửa và gán lời em chưa từng nói. Em hãy lưu bản đăng, đường dẫn và thời điểm, yêu cầu người đăng gỡ bỏ, báo cáo nền tảng và nhờ giáo viên hoặc gia đình hỗ trợ đính chính. Đừng đăng lại ảnh ghép chỉ để chứng minh mình bị hại.",
  "legal": "Quyền được tôn trọng danh dự, nhân phẩm; cần xem xét bối cảnh và mức độ."
 },
 {
  "id": "DEV027",
  "question": "Bạn cũ cứ đăng bài bóng gió nói em lừa dối, nhiều người vào hỏi em có chuyện gì.",
  "assessment": "Bạn bị bài đăng bóng gió từ bạn cũ.",
  "advice": "Cô hiểu những bài đăng úp mở khiến em bị người khác hỏi dồn. Em có thể không trả lời công khai, lưu các bài có liên quan và nhắn riêng một lần để đề nghị ngừng ám chỉ nếu an toàn. Nếu tiếp diễn hoặc có nội dung sai sự thật, nhờ người lớn hỗ trợ.",
  "legal": "Quyền được tôn trọng danh dự, nhân phẩm; cần xem xét bối cảnh và mức độ."
 },
 {
  "id": "DEV028",
  "question": "Em nghe tin xấu về một bạn và định share để cảnh báo mọi người, nhưng em ko biết có thật ko.",
  "assessment": "Người hỏi định chia sẻ tin xấu chưa xác minh.",
  "advice": "Em khoan chia sẻ nhé. Khi chưa biết tin có thật không, việc “cảnh báo” có thể vô tình làm hại danh dự của bạn. Nếu lo có nguy cơ thực sự, hãy báo riêng cho giáo viên hoặc người có trách nhiệm để xác minh, thay vì phát tán lên mạng.",
  "legal": "Quyền được tôn trọng danh dự, nhân phẩm; cần xem xét bối cảnh và mức độ."
 },
 {
  "id": "DEV029",
  "question": "Có bạn lập tài khoản giống tên và avatar em để đăng mấy thứ tục tĩu.",
  "assessment": "Có tài khoản giả tên và ảnh người hỏi để đăng nội dung tục.",
  "advice": "Em hãy lưu đường dẫn, ảnh chụp tài khoản giả và báo cáo hành vi mạo danh; nhờ bạn bè không tương tác hoặc chia sẻ nội dung đó. Nói với giáo viên, gia đình để hỗ trợ làm rõ, và kiểm tra cài đặt bảo mật tài khoản của em. Đây không phải lỗi của em.",
  "legal": "Quyền được tôn trọng danh dự, nhân phẩm; cần xem xét bối cảnh và mức độ."
 },
 {
  "id": "DEV030",
  "question": "Tin đồn về gia đình em bị truyền trong lớp, e rất xấu hổ và ko muốn đi học.",
  "assessment": "Tin đồn về gia đình khiến người hỏi không muốn đi học.",
  "advice": "Cô rất tiếc vì chuyện gia đình khiến em bị soi mói. Em không cần kể chi tiết riêng tư để tự bảo vệ mình. Hãy báo giáo viên chủ nhiệm hoặc người lớn em tin tưởng, nhờ họ can thiệp tin đồn và hỗ trợ em trở lại lớp an toàn; nếu quá căng thẳng, em có thể xin gặp bộ phận tư vấn học đường.",
  "legal": "Quyền được tôn trọng danh dự, nhân phẩm; cần xem xét bối cảnh và mức độ."
 },
 {
  "id": "DEV031",
  "question": "Bạn chụp lúc em ngủ gục rồi đăng lên gr lớp làm meme, em yêu cầu xóa mà bạn ko xóa.",
  "assessment": "Ảnh ngủ gục bị dùng làm meme dù đã yêu cầu xóa.",
  "advice": "Em đã yêu cầu xóa mà bạn không làm, vậy em nên lưu bài đăng và tin nhắn yêu cầu gỡ. Hãy báo quản trị nhóm, giáo viên chủ nhiệm hoặc nền tảng để được hỗ trợ gỡ nội dung. Em không phải chấp nhận bị đem hình ảnh ra trêu chỉ vì ảnh được chụp ở lớp.",
  "legal": "Quyền đối với hình ảnh và đời sống riêng tư; tham chiếu Điều 32 và Điều 38 Bộ luật Dân sự 2015 tùy tình huống."
 },
 {
  "id": "DEV032",
  "question": "Em gửi ảnh riêng cho bạn thân, giờ bạn dọa nếu em nghỉ chơi sẽ tung ảnh.",
  "assessment": "Bạn thân dùng ảnh riêng để đe dọa phát tán.",
  "advice": "Cô hiểu em sợ khi người em tin tưởng đem ảnh riêng ra đe dọa. Em không có lỗi vì đã tin bạn. Đừng gửi thêm ảnh, tiền hay làm theo yêu cầu của bạn để đổi lấy sự im lặng. Hãy lưu tin nhắn đe dọa, báo ngay cho cha mẹ hoặc người lớn em tin tưởng để được giúp đỡ yêu cầu gỡ ảnh và bảo vệ an toàn. Nếu là ảnh nhạy cảm, đừng gửi ảnh đó thêm cho bất kỳ ai, kể cả để chứng minh sự việc.",
  "legal": "Quyền đối với hình ảnh và đời sống riêng tư; tham chiếu Điều 32 và Điều 38 Bộ luật Dân sự 2015 tùy tình huống."
 },
 {
  "id": "DEV033",
  "question": "Có bạn quay video em bị ngã rồi up tiktok, video đang nhiều view. e muốn gỡ thì làm sao",
  "assessment": "Video người hỏi bị ngã lan truyền trên TikTok.",
  "advice": "Em có thể lưu đường dẫn và ảnh chụp bài đăng, dùng chức năng báo cáo của TikTok và yêu cầu người đăng gỡ video. Nhờ gia đình hoặc giáo viên hỗ trợ nếu em bị chế giễu hoặc nội dung tiếp tục lan truyền. Em không cần bình luận đôi co dưới video.",
  "legal": "Quyền đối với hình ảnh và đời sống riêng tư; tham chiếu Điều 32 và Điều 38 Bộ luật Dân sự 2015 tùy tình huống."
 },
 {
  "id": "DEV034",
  "question": "Bạn lấy ảnh trên fb của em ghép mặt vào hình xấu rồi gửi khắp lớp.",
  "assessment": "Ảnh người hỏi bị ghép xấu và gửi khắp lớp.",
  "advice": "Cô hiểu việc ảnh của em bị sửa rồi gửi đi khiến em khó chịu và xấu hổ. Hãy lưu một vài bằng chứng cần thiết, nhờ giáo viên yêu cầu dừng chia sẻ và hỗ trợ gỡ nội dung. Em đừng tự phát tán ảnh ghép để phản bác vì như vậy ảnh càng lan rộng.",
  "legal": "Quyền đối với hình ảnh và đời sống riêng tư; tham chiếu Điều 32 và Điều 38 Bộ luật Dân sự 2015 tùy tình huống."
 },
 {
  "id": "DEV035",
  "question": "Em lỡ đăng ảnh bạn lên story để chọc, bạn nói ko đồng ý. Em đã xóa rồi thì còn cần làm gì nữa ko?",
  "assessment": "Người hỏi đã đăng ảnh bạn, đã xóa và muốn sửa.",
  "advice": "Xóa story là bước đúng, nhưng em vẫn nên xin lỗi vì đã dùng ảnh bạn khi bạn không đồng ý. Hỏi bạn xem có ai lưu hoặc chia sẻ lại không và cùng tìm cách yêu cầu gỡ nếu có. Sau này hãy xin phép trước khi đăng hình người khác, em nhé.",
  "legal": "Quyền đối với hình ảnh và đời sống riêng tư; tham chiếu Điều 32 và Điều 38 Bộ luật Dân sự 2015 tùy tình huống."
 },
 {
  "id": "DEV036",
  "question": "Có người cap đoạn chat riêng của em với bạn rồi đăng công khai, chỉ che tên người kia chứ ko che tên em.",
  "assessment": "Đoạn chat riêng của người hỏi bị công khai kèm tên.",
  "advice": "Em có quyền khó chịu khi tin nhắn riêng bị đưa ra công khai. Hãy lưu đường dẫn và nội dung, đề nghị người đăng gỡ và báo cáo bài viết nếu cần. Nếu họ không hợp tác hoặc thông tin gây ảnh hưởng, hãy nhờ giáo viên hay người lớn đáng tin cậy hỗ trợ, đừng công khai thêm chuyện riêng để tranh cãi.",
  "legal": "Quyền đối với hình ảnh và đời sống riêng tư; tham chiếu Điều 32 và Điều 38 Bộ luật Dân sự 2015 tùy tình huống."
 },
 {
  "id": "DEV037",
  "question": "Bạn xin ảnh em để làm bài nhưng sau đó dùng ảnh đó làm meme. Em thấy bị lừa.",
  "assessment": "Ảnh được xin cho mục đích học tập nhưng bị biến thành meme.",
  "advice": "Bạn xin ảnh để làm bài nhưng lại dùng làm meme, điều đó khác với mục đích em đã đồng ý. Em hãy nói rõ em không cho phép sử dụng như vậy, yêu cầu gỡ và nhờ giáo viên hỗ trợ nếu bạn không thực hiện. Cô hiểu vì sao em cảm thấy mất lòng tin.",
  "legal": "Quyền đối với hình ảnh và đời sống riêng tư; tham chiếu Điều 32 và Điều 38 Bộ luật Dân sự 2015 tùy tình huống."
 },
 {
  "id": "DEV038",
  "question": "Một bạn quay cảnh hai bạn khác cãi nhau rồi gửi em, em có nên gửi tiếp vào gr lớp ko?",
  "assessment": "Người chứng kiến được gửi clip cãi nhau, hỏi có nên chuyển tiếp.",
  "advice": "Em đừng gửi clip vào nhóm lớp nhé, vì việc lan truyền có thể khiến hai bạn bị bêu riếu và mâu thuẫn tăng lên. Nếu clip cho thấy nguy cơ đánh nhau, hãy báo giáo viên và chỉ cung cấp bằng chứng qua kênh phù hợp; còn nếu không nguy hiểm, hãy khuyên người quay ngừng chia sẻ.",
  "legal": "Quyền đối với hình ảnh và đời sống riêng tư; tham chiếu Điều 32 và Điều 38 Bộ luật Dân sự 2015 tùy tình huống."
 },
 {
  "id": "DEV039",
  "question": "Em phát hiện có clip của mình bị đăng trong nhóm kín mà em ko được vào nhóm đó.",
  "assessment": "Clip của người hỏi bị đăng trong nhóm kín.",
  "advice": "Cô hiểu em lo khi biết clip của mình xuất hiện trong nhóm em không được vào. Nếu an toàn, hãy yêu cầu người đăng gỡ và nhờ người tin cậy xác nhận đường dẫn, lưu bằng chứng phù hợp. Nếu họ không gỡ, clip nhạy cảm hoặc em bị đe dọa, hãy báo ngay cha mẹ, giáo viên và nền tảng. Đừng trả đũa hay tìm cách đột nhập nhóm.",
  "legal": "Quyền đối với hình ảnh và đời sống riêng tư; tham chiếu Điều 32 và Điều 38 Bộ luật Dân sự 2015 tùy tình huống."
 },
 {
  "id": "DEV040",
  "question": "Bạn dùng AI ghép mặt em vào ảnh nhạy cảm rồi dọa gửi cho người khác nếu em ko nghe lời.",
  "assessment": "Ảnh nhạy cảm giả mạo bằng AI dùng để cưỡng ép.",
  "advice": "Cô rất tiếc vì em bị đe dọa bằng ảnh nhạy cảm do AI tạo ra. Ảnh giả không làm em trở thành người có lỗi. Đừng gửi tiền, ảnh hay gặp riêng người đe dọa. Em hãy lưu lời đe dọa và đường dẫn bài đăng nếu có, rồi báo ngay cha mẹ, giáo viên hoặc người lớn đáng tin cậy. Nhờ người lớn hỗ trợ báo cáo và yêu cầu gỡ nội dung; không chuyển tiếp ảnh nhạy cảm để làm bằng chứng.",
  "legal": "Quyền đối với hình ảnh và đời sống riêng tư; tham chiếu Điều 32 và Điều 38 Bộ luật Dân sự 2015 tùy tình huống."
 },
 {
  "id": "DEV041",
  "question": "Bạn chửi em trước nên em chửi lại nặng hơn, giờ 2 bên đang rủ người ra nói chuyện.",
  "assessment": "Hai bên chửi nhau, có nguy cơ hẹn đánh nhau.",
  "advice": "Cô hiểu em đang rất nóng giận, nhưng lúc này an toàn quan trọng hơn việc phân thắng thua. Em hãy dừng nhắn lời kích động, không đi gặp nhóm người ngoài trường và báo ngay giáo viên, cha mẹ về lời hẹn. Khi mọi người bình tĩnh, hãy nhận phần sai của mình và nhờ người lớn hỗ trợ hòa giải.",
  "legal": "Không sử dụng bạo lực hay đe dọa; tìm người có trách nhiệm hỗ trợ, không tự kết luận trách nhiệm pháp lý."
 },
 {
  "id": "DEV042",
  "question": "Em với bạn cãi nhau trong game, hôm sau bạn tiếp tục khịa em ở lớp. Em muốn giải quyết cho xong.",
  "assessment": "Xung đột từ game kéo sang lớp.",
  "advice": "Chuyện trong game đang ảnh hưởng đến việc học của em. Em hãy ngừng đáp trả lời khịa, nói rõ rằng em muốn kết thúc tranh cãi và chỉ trao đổi khi bình tĩnh. Nếu bạn tiếp tục xúc phạm ở lớp, nhờ giáo viên chủ nhiệm hỗ trợ thay vì hẹn nhau “giải quyết cho xong”.",
  "legal": "Không sử dụng bạo lực hay đe dọa; tìm người có trách nhiệm hỗ trợ, không tự kết luận trách nhiệm pháp lý."
 },
 {
  "id": "DEV043",
  "question": "Bạn giấu cặp của em nên em lấy điện thoại bạn giấu lại. Giờ ai cũng nói người kia sai.",
  "assessment": "Hai bên giấu đồ của nhau để trả đũa.",
  "advice": "Việc bạn giấu cặp của em là sai, nhưng lấy điện thoại bạn giấu lại cũng khiến mâu thuẫn nặng hơn. Em hãy trả điện thoại nguyên vẹn, đề nghị bạn trả cặp và nhờ giáo viên chứng kiến nếu cần. Cô mong hai em giải quyết bằng việc hoàn trả đồ và nhận trách nhiệm, không tiếp tục trả đũa.",
  "legal": "Không sử dụng bạo lực hay đe dọa; tìm người có trách nhiệm hỗ trợ, không tự kết luận trách nhiệm pháp lý."
 },
 {
  "id": "DEV044",
  "question": "Bạn đăng status đá xéo em, em định đăng ảnh xấu của bạn để trả đũa có được ko?",
  "assessment": "Người hỏi định đăng ảnh xấu để trả đũa story.",
  "advice": "Em đừng đăng ảnh xấu của bạn nhé. Một status khiến em bực không cho phép mình xâm phạm hình ảnh người khác. Em có thể lưu status, tạm ngừng theo dõi và trao đổi riêng khi bình tĩnh; nếu bị nhắm tới kéo dài, hãy nhờ giáo viên hỗ trợ.",
  "legal": "Không sử dụng bạo lực hay đe dọa; tìm người có trách nhiệm hỗ trợ, không tự kết luận trách nhiệm pháp lý."
 },
 {
  "id": "DEV045",
  "question": "Hai nhóm trong lớp đang khẩu chiến trên gr, ai cũng cap màn hình bên kia để chế ảnh.",
  "assessment": "Hai nhóm công kích nhau và chế ảnh trong nhóm.",
  "advice": "Cô mong em đừng tham gia chụp màn hình để chế giễu hoặc chuyển tiếp ảnh. Nếu em có vai trò quản trị, hãy đề nghị dừng bài công kích và báo giáo viên chủ nhiệm để can thiệp. Việc mỗi bên giữ bằng chứng cho người có trách nhiệm khác với đăng lại để trả đũa.",
  "legal": "Không sử dụng bạo lực hay đe dọa; tìm người có trách nhiệm hỗ trợ, không tự kết luận trách nhiệm pháp lý."
 },
 {
  "id": "DEV046",
  "question": "Em lỡ đẩy bạn khi bạn chọc em, bạn đẩy lại. Tụi em ko bị thương nhưng đang rất tức.",
  "assessment": "Hai bên xô đẩy, chưa bị thương.",
  "advice": "Dù chưa ai bị thương, việc đẩy qua lại có thể dẫn đến tai nạn. Em hãy tránh tiếp xúc khi còn tức, báo giáo viên về sự việc và nhận trách nhiệm vì đã đẩy trước nếu đúng như em kể. Chỉ trao đổi để hòa giải khi có người lớn hỗ trợ và hai bên đã bình tĩnh.",
  "legal": "Không sử dụng bạo lực hay đe dọa; tìm người có trách nhiệm hỗ trợ, không tự kết luận trách nhiệm pháp lý."
 },
 {
  "id": "DEV047",
  "question": "Bạn A và em hiểu lầm chuyện mượn đồ, giờ A cứ nói em cố tình lấy. Em muốn nói chuyện nhưng sợ cãi tiếp.",
  "assessment": "Hiểu lầm mượn đồ, sợ đối thoại thành cãi nhau.",
  "advice": "Em có thể nhờ giáo viên hoặc một người trung gian chứng kiến cuộc nói chuyện ngắn. Hãy chuẩn bị thời điểm mượn, cách trả và những gì em nhớ, rồi nói bằng câu “Mình muốn làm rõ” thay vì buộc tội. Nếu bạn vẫn nóng giận, tạm dừng để tránh cãi tiếp.",
  "legal": "Không sử dụng bạo lực hay đe dọa; tìm người có trách nhiệm hỗ trợ, không tự kết luận trách nhiệm pháp lý."
 },
 {
  "id": "DEV048",
  "question": "Em bị bạn khiêu khích kiểu “giỏi thì đánh tao đi”. Em nên làm gì lúc đó?",
  "assessment": "Bạn khiêu khích đánh nhau.",
  "advice": "Khi nghe “giỏi thì đánh tao đi”, em đừng chứng minh điều gì bằng nắm đấm. Hãy lùi ra chỗ đông người, nói ngắn “Mình không đánh nhau” và tìm giáo viên hoặc người lớn gần đó. Nếu bạn chặn đường hoặc tiến tới đe dọa, ưu tiên rời khỏi nơi nguy hiểm.",
  "legal": "Không sử dụng bạo lực hay đe dọa; tìm người có trách nhiệm hỗ trợ, không tự kết luận trách nhiệm pháp lý."
 },
 {
  "id": "DEV049",
  "question": "Bạn nói xấu em nên em rủ bạn bè vào comment chửi lại, giờ chuyện lớn hơn rồi. Em sửa sao?",
  "assessment": "Người hỏi đã rủ người vào chửi, muốn khắc phục.",
  "advice": "Em hãy ngừng ngay lời kêu gọi bình luận, xóa những bình luận xúc phạm của mình nếu có và nhắn mọi người dừng lại. Sau đó xin lỗi người bị công kích, không đổ lỗi rằng bạn ấy nói xấu trước. Nếu sự việc lan rộng, nhờ giáo viên hỗ trợ hòa giải.",
  "legal": "Không sử dụng bạo lực hay đe dọa; tìm người có trách nhiệm hỗ trợ, không tự kết luận trách nhiệm pháp lý."
 },
 {
  "id": "DEV050",
  "question": "Tụi em chỉ cãi nhau một lần rồi thôi, ko ai đe dọa hay lặp lại. Như vậy có phải bạo lực học đường ko?",
  "assessment": "Cãi nhau một lần, không đe dọa hay lặp lại.",
  "advice": "Một lần tranh cãi chưa đủ để kết luận là bắt nạt, em nhé; cần xem có xúc phạm nghiêm trọng, đe dọa hay tổn hại nào không. Nếu hai em đã dừng và an toàn, có thể trao đổi bình tĩnh để hiểu nhau. Nếu mâu thuẫn tái diễn, hãy tìm người lớn hỗ trợ.",
  "legal": "Không sử dụng bạo lực hay đe dọa; tìm người có trách nhiệm hỗ trợ, không tự kết luận trách nhiệm pháp lý."
 },
 {
  "id": "DEV051",
  "question": "Bạn nhắn tan học sẽ chờ em ngoài cổng để xử em. e sợ ko dám về một mình.",
  "assessment": "Bị đe dọa đánh ngoài cổng ngay sau giờ học.",
  "advice": "Cô hiểu em sợ và em không nên về một mình lúc này. Hãy báo ngay giáo viên, bảo vệ trường và cha mẹ; ở nơi có người lớn, không ra cổng gặp người đe dọa. Giữ tin nhắn làm bằng chứng và nhờ người lớn sắp xếp đường về an toàn.",
  "legal": "Không sử dụng bạo lực hay đe dọa; tìm người có trách nhiệm hỗ trợ, không tự kết luận trách nhiệm pháp lý."
 },
 {
  "id": "DEV052",
  "question": "Nó bảo chiều nay ra công viên nói chuyện, em ko đi thì nó nói sẽ cho em biết tay.",
  "assessment": "Bị ép ra công viên và đe dọa nếu không đi.",
  "advice": "Em không cần đến công viên để chứng minh mình can đảm. Hãy từ chối cuộc hẹn, giữ tin nhắn và báo ngay cha mẹ hoặc giáo viên để được bảo vệ khi đi học và về nhà. Nếu người đó tìm đến hoặc có nguy cơ tấn công, hãy tìm nơi đông người và nhờ hỗ trợ khẩn cấp.",
  "legal": "Không sử dụng bạo lực hay đe dọa; tìm người có trách nhiệm hỗ trợ, không tự kết luận trách nhiệm pháp lý."
 },
 {
  "id": "DEV053",
  "question": "Bạn gửi tin “mai mày chết với tao”, em ko biết bạn nói thật hay chỉ hù.",
  "assessment": "Tin nhắn “mai mày chết với tao” chưa rõ thật giả.",
  "advice": "Câu nói đó có thể là đe dọa nghiêm trọng, dù em chưa biết người gửi có làm thật không. Đừng tự thử xem họ có nói đùa hay không. Hãy chụp tin nhắn, báo ngay giáo viên và gia đình để đánh giá nguy cơ, tránh gặp riêng người đó.",
  "legal": "Không sử dụng bạo lực hay đe dọa; tìm người có trách nhiệm hỗ trợ, không tự kết luận trách nhiệm pháp lý."
 },
 {
  "id": "DEV054",
  "question": "Một bạn nói sẽ mang dao tới trường để xử em. Em phải làm gì ngay bây giờ?",
  "assessment": "Đe dọa mang dao tới trường.",
  "advice": "Cô rất lo vì có lời nói sẽ mang dao đến trường. Em hãy đến ngay nơi có giáo viên hoặc bảo vệ, báo rõ người nói, thời gian và nội dung em biết; đồng thời gọi cha mẹ. Đừng tìm người đó, đừng tự kiểm tra xem lời đe dọa có thật không và đừng tụ tập xem. Nếu nguy hiểm đang diễn ra hoặc có người mang hung khí, nhờ người lớn gọi 113; nếu có người bị thương, gọi 115.",
  "legal": "Không sử dụng bạo lực hay đe dọa; tìm người có trách nhiệm hỗ trợ, không tự kết luận trách nhiệm pháp lý."
 },
 {
  "id": "DEV055",
  "question": "Bạn cứ đứng chờ gần cổng trường mấy hôm nay, thấy em là đi theo. Em rất sợ.",
  "assessment": "Bị theo dõi gần cổng trường nhiều ngày.",
  "advice": "Cô hiểu em rất sợ khi có người liên tục chờ và đi theo. Hãy báo ngay gia đình, giáo viên và bảo vệ trường, nhờ người lớn đón hoặc đi cùng trên đường về. Ghi lại thời gian, địa điểm và đặc điểm người đó nếu an toàn; đừng tự quay lại đối chất.",
  "legal": "Không sử dụng bạo lực hay đe dọa; tìm người có trách nhiệm hỗ trợ, không tự kết luận trách nhiệm pháp lý."
 },
 {
  "id": "DEV056",
  "question": "Bạn hẹn em ra chỗ vắng, nói nếu ko ra thì sẽ tung “hàng nóng” và kiếm em.",
  "assessment": "Bị ép ra chỗ vắng và dọa tung “hàng nóng”.",
  "advice": "Em tuyệt đối đừng đến chỗ vắng một mình. “Hàng nóng” có thể mang nhiều nghĩa nên cô chưa kết luận đó là gì, nhưng lời đe dọa và ép gặp đã đủ để báo ngay cha mẹ, giáo viên. Hãy giữ tin nhắn, không thương lượng riêng; nếu có nguy cơ tức thời, tìm hỗ trợ khẩn cấp.",
  "legal": "Không sử dụng bạo lực hay đe dọa; tìm người có trách nhiệm hỗ trợ, không tự kết luận trách nhiệm pháp lý."
 },
 {
  "id": "DEV057",
  "question": "Trong gr lớp có người nói “mai tao úp sọt mày”, em ko hiểu họ có làm thật ko.",
  "assessment": "Lời đe dọa “úp sọt” trong nhóm.",
  "advice": "Cô không thể biết họ có làm thật hay không, nhưng “úp sọt” có thể ám chỉ đánh hội đồng nên em cần thận trọng. Hãy lưu tin nhắn, báo giáo viên và gia đình ngay hôm nay, không đi một mình tới điểm hẹn hoặc nơi vắng. Đừng đáp lại bằng lời thách thức.",
  "legal": "Không sử dụng bạo lực hay đe dọa; tìm người có trách nhiệm hỗ trợ, không tự kết luận trách nhiệm pháp lý."
 },
 {
  "id": "DEV058",
  "question": "Bạn đe dọa đánh em nhưng ko nói khi nào ở đâu. Em có cần báo người lớn ngay ko?",
  "assessment": "Bị dọa đánh chưa rõ thời gian.",
  "advice": "Có em, nên báo người lớn ngay cả khi chưa biết họ sẽ đánh lúc nào. Em hãy lưu lời đe dọa, nói với giáo viên hoặc cha mẹ và tránh gặp riêng người đó. Nhờ người lớn cùng đánh giá mức nguy hiểm và lên cách đi học, về nhà an toàn.",
  "legal": "Không sử dụng bạo lực hay đe dọa; tìm người có trách nhiệm hỗ trợ, không tự kết luận trách nhiệm pháp lý."
 },
 {
  "id": "DEV059",
  "question": "Em nghe bạn A nói sẽ đánh bạn B sau giờ học. B chưa biết chuyện này. Em nên làm gì?",
  "assessment": "Người chứng kiến nghe kế hoạch đánh bạn.",
  "advice": "Em nên báo ngay giáo viên, bảo vệ trường hoặc người lớn có trách nhiệm để họ bảo vệ bạn B trước giờ tan học. Đừng tự đi đối chất với A hay lan tin khắp lớp. Nếu có thể, cung cấp đúng điều em nghe được, phân biệt rõ điều tận tai nghe với suy đoán.",
  "legal": "Không sử dụng bạo lực hay đe dọa; tìm người có trách nhiệm hỗ trợ, không tự kết luận trách nhiệm pháp lý."
 },
 {
  "id": "DEV060",
  "question": "Em nóng quá nên nhắn bạn “mai tao xử mày”. Giờ em ko định đánh thật nhưng bạn đã rất sợ. Em phải sửa thế nào?",
  "assessment": "Người hỏi đã nhắn đe dọa và muốn sửa.",
  "advice": "Em cần nhắn lại ngay rằng em sẽ không đánh bạn, xin lỗi vì lời đe dọa và dừng mọi lời kích động. Hãy báo giáo viên hoặc cha mẹ để giúp hai bên yên tâm, nhất là nếu đã có lời hẹn gặp. Bạn sợ là điều dễ hiểu; em hãy chứng minh bằng hành động an toàn.",
  "legal": "Không sử dụng bạo lực hay đe dọa; tìm người có trách nhiệm hỗ trợ, không tự kết luận trách nhiệm pháp lý."
 },
 {
  "id": "DEV061",
  "question": "Bạn bắt em phải mua đồ ăn cho bạn mỗi ngày, ko mua thì dọa đánh.",
  "assessment": "Bị ép mua đồ ăn hằng ngày bằng đe dọa.",
  "advice": "Đây không phải việc em phải chiều theo để được yên thân. Hãy báo giáo viên chủ nhiệm và cha mẹ, giữ tin nhắn hoặc ghi lại những lần bị ép; tránh gặp riêng người đe dọa. Người lớn cần giúp em chấm dứt việc ép buộc và bảo đảm an toàn khi đến trường.",
  "legal": "Không sử dụng bạo lực hay đe dọa; tìm người có trách nhiệm hỗ trợ, không tự kết luận trách nhiệm pháp lý."
 },
 {
  "id": "DEV062",
  "question": "Mấy anh lớp trên bảo em đưa tiền nếu ko sẽ chặn đường về. Em chưa đưa.",
  "assessment": "Bị học sinh lớp trên đòi tiền và dọa chặn đường.",
  "advice": "Em đừng tự đi gặp để đưa tiền hay tranh cãi. Hãy báo ngay giáo viên, bảo vệ trường và gia đình, nhờ người lớn đi cùng khi tan học. Giữ bằng chứng và mô tả người đòi tiền; nếu bị chặn đường, tìm nơi đông người và gọi hỗ trợ khẩn cấp.",
  "legal": "Không sử dụng bạo lực hay đe dọa; tìm người có trách nhiệm hỗ trợ, không tự kết luận trách nhiệm pháp lý."
 },
 {
  "id": "DEV063",
  "question": "Bạn ép em làm bài hộ, nói ko làm thì sẽ tung đoạn chat riêng của em.",
  "assessment": "Bị ép làm bài hộ bằng đe dọa lộ chat riêng.",
  "advice": "Em không cần làm bài hộ để đổi lấy sự im lặng. Hãy lưu tin nhắn đe dọa, báo giáo viên chủ nhiệm hoặc người lớn đáng tin cậy để họ vừa bảo vệ chuyện riêng của em vừa xử lý việc ép buộc. Đừng gửi thêm thông tin cá nhân hay tiếp tục mặc cả.",
  "legal": "Không sử dụng bạo lực hay đe dọa; tìm người có trách nhiệm hỗ trợ, không tự kết luận trách nhiệm pháp lý."
 },
 {
  "id": "DEV064",
  "question": "Bạn bắt em phải đi gặp riêng dù em nói ko muốn, rồi nhắn liên tục ép em đi.",
  "assessment": "Bị ép gặp riêng và nhắn liên tục.",
  "advice": "Em đã nói không muốn gặp thì người kia phải tôn trọng. Em không cần giải thích thêm nhiều lần; hãy giữ tin nhắn, báo người lớn đáng tin cậy và không đến cuộc hẹn một mình. Nếu người đó tìm đến hoặc chặn đường, ưu tiên tìm nơi an toàn.",
  "legal": "Không sử dụng bạo lực hay đe dọa; tìm người có trách nhiệm hỗ trợ, không tự kết luận trách nhiệm pháp lý."
 },
 {
  "id": "DEV065",
  "question": "Một bạn mượn điện thoại em rồi ko trả, còn nói em báo cô thì coi chừng.",
  "assessment": "Điện thoại bị giữ và bị đe dọa khi báo cô.",
  "advice": "Em hãy báo ngay giáo viên và gia đình, nói rõ ai đang giữ điện thoại và lời đe dọa. Đừng tự giằng lại hoặc gặp riêng để đòi nếu có nguy cơ xô xát. Nhờ người lớn hỗ trợ lấy lại tài sản và bảo vệ em.",
  "legal": "Không sử dụng bạo lực hay đe dọa; tìm người có trách nhiệm hỗ trợ, không tự kết luận trách nhiệm pháp lý."
 },
 {
  "id": "DEV066",
  "question": "Bạn yêu cầu em đưa mật khẩu fb để chứng minh em ko nói xấu bạn. Em có nên đưa ko?",
  "assessment": "Bị yêu cầu giao mật khẩu Facebook.",
  "advice": "Em tuyệt đối không cần đưa mật khẩu để chứng minh mình vô tội. Em hãy từ chối, bật xác thực hai yếu tố và báo người lớn nếu bạn tiếp tục gây sức ép. Nếu đã lỡ cung cấp, hãy đổi mật khẩu ngay và đăng xuất khỏi thiết bị lạ.",
  "legal": "Không sử dụng bạo lực hay đe dọa; tìm người có trách nhiệm hỗ trợ, không tự kết luận trách nhiệm pháp lý."
 },
 {
  "id": "DEV067",
  "question": "Em bị ép phải xin lỗi trước cả lớp về chuyện em ko làm, nếu ko nhóm bạn nói sẽ tẩy chay em.",
  "assessment": "Bị ép xin lỗi công khai về việc không làm.",
  "advice": "Cô hiểu em thấy bất công. Em không cần nhận lỗi về chuyện mình không làm chỉ vì sợ bị tẩy chay. Hãy lưu lời đe dọa, kể sự việc với giáo viên chủ nhiệm và nhờ cô xác minh, bảo vệ em trước sức ép của nhóm.",
  "legal": "Không sử dụng bạo lực hay đe dọa; tìm người có trách nhiệm hỗ trợ, không tự kết luận trách nhiệm pháp lý."
 },
 {
  "id": "DEV068",
  "question": "Bạn bảo em gửi ảnh riêng tư, em từ chối thì bạn dọa đăng chuyện xấu về em.",
  "assessment": "Bị ép gửi ảnh riêng tư, dọa bôi xấu.",
  "advice": "Em đừng gửi bất kỳ ảnh riêng tư nào để đổi lấy lời hứa không nói xấu. Hãy lưu tin nhắn đe dọa, chặn liên hệ khi đã giữ bằng chứng và báo ngay cha mẹ hoặc người lớn đáng tin cậy. Nếu họ phát tán nội dung, nhờ người lớn hỗ trợ báo cáo và gỡ bỏ.",
  "legal": "Không sử dụng bạo lực hay đe dọa; tìm người có trách nhiệm hỗ trợ, không tự kết luận trách nhiệm pháp lý."
 },
 {
  "id": "DEV069",
  "question": "Bạn bắt em chép bài cho bạn và giữ đồ của em đến khi em làm xong.",
  "assessment": "Bị giữ đồ để ép chép bài.",
  "advice": "Bạn không có quyền giữ đồ của em để buộc em làm bài hộ. Em hãy báo giáo viên bộ môn hoặc chủ nhiệm, nói rõ món đồ và thời điểm bị giữ; nhờ cô hỗ trợ lấy lại. Đừng tự giằng co hoặc làm bài thay để chấm dứt sự việc.",
  "legal": "Không sử dụng bạo lực hay đe dọa; tìm người có trách nhiệm hỗ trợ, không tự kết luận trách nhiệm pháp lý."
 },
 {
  "id": "DEV070",
  "question": "Mấy bạn ép em tham gia đánh một bạn khác, nói nếu em ko tham gia thì lần sau sẽ tới lượt em.",
  "assessment": "Bị ép tham gia đánh bạn khác, dọa sẽ đến lượt mình.",
  "advice": "Em đừng tham gia đánh bạn dù bị ép, vì điều đó gây nguy hiểm cho cả hai. Hãy báo ngay giáo viên, ban giám hiệu hoặc gia đình về lời đe dọa và kế hoạch đánh nhau. Tránh đi một mình và nhờ người lớn bảo vệ cả em lẫn bạn đang bị nhắm tới.",
  "legal": "Không sử dụng bạo lực hay đe dọa; tìm người có trách nhiệm hỗ trợ, không tự kết luận trách nhiệm pháp lý."
 },
 {
  "id": "DEV071",
  "question": "Bạn cứ nhắn tin hỏi chuyện tình cảm dù em nói ko muốn nói nữa, ngày nào cũng nhắn.",
  "assessment": "Bị nhắn chuyện tình cảm liên tục dù đã từ chối.",
  "advice": "Em có quyền không trả lời những câu hỏi tình cảm khiến mình khó chịu. Em có thể nhắn một lần rằng em không muốn tiếp tục chủ đề này, rồi hạn chế liên hệ. Nếu bạn vẫn nhắn hằng ngày, hãy lưu bằng chứng và nhờ giáo viên hoặc người lớn hỗ trợ.",
  "legal": "Tôn trọng ranh giới cá nhân, quyền riêng tư và an toàn của học sinh; chưa đủ dữ kiện để xác định trách nhiệm pháp lý."
 },
 {
  "id": "DEV072",
  "question": "Có bạn liên tục bình luận về cơ thể em làm em rất khó chịu.",
  "assessment": "Bị bình luận về cơ thể liên tục.",
  "advice": "Cô hiểu những lời nhận xét về cơ thể có thể khiến em xấu hổ. Em hãy nói rõ rằng em không đồng ý để bạn bình luận như vậy. Nếu hành vi lặp lại, ghi lại thời điểm và báo giáo viên chủ nhiệm; em không cần thay đổi cơ thể để được tôn trọng.",
  "legal": "Tôn trọng ranh giới cá nhân, quyền riêng tư và an toàn của học sinh; chưa đủ dữ kiện để xác định trách nhiệm pháp lý."
 },
 {
  "id": "DEV073",
  "question": "Bạn cứ chạm vào người em dù em đã né và nói dừng. Em ko biết phải nói với ai.",
  "assessment": "Bị đụng chạm dù đã nói dừng.",
  "advice": "Cô muốn em biết rằng cơ thể em là của em; khi em đã né và nói dừng, bạn không được tiếp tục chạm vào người em. Hãy rời đến nơi có người lớn nếu an toàn và báo ngay cho giáo viên, cha mẹ hoặc một người lớn em tin tưởng. Em có thể nói rõ ai đã làm gì, ở đâu, lúc nào; em không cần tự đối chất với người đó. Nếu em đang bị giữ lại hoặc có nguy cơ bị xâm hại, hãy kêu cứu và tìm hỗ trợ khẩn cấp.",
  "legal": "Tôn trọng ranh giới cá nhân, quyền riêng tư và an toàn của học sinh; chưa đủ dữ kiện để xác định trách nhiệm pháp lý."
 },
 {
  "id": "DEV074",
  "question": "Một người trong trường nhắn xin ảnh nhạy cảm của em, em từ chối nhưng họ vẫn hỏi tiếp.",
  "assessment": "Bị liên tục xin ảnh nhạy cảm.",
  "advice": "Em có quyền từ chối hoàn toàn việc gửi ảnh nhạy cảm. Em đừng gửi ảnh, cũng đừng tiếp tục thương lượng với người đang gây sức ép. Hãy giữ các tin nhắn yêu cầu và nói ngay với cha mẹ, giáo viên hoặc người lớn em tin tưởng để họ giúp ngăn việc quấy rối. Nếu người nhắn là người có quyền lực với em, hãy chọn một người lớn khác để báo; không cần tự giải quyết một mình.",
  "legal": "Tôn trọng ranh giới cá nhân, quyền riêng tư và an toàn của học sinh; chưa đủ dữ kiện để xác định trách nhiệm pháp lý."
 },
 {
  "id": "DEV075",
  "question": "Bạn gửi hình tục vào gr rồi tag tên em để chọc. Em ko muốn xem.",
  "assessment": "Bị gửi nội dung tục và gắn thẻ để trêu.",
  "advice": "Em có quyền không xem những hình ảnh đó. Hãy tránh mở lại hoặc chuyển tiếp, báo quản trị nhóm để gỡ nội dung và nhờ giáo viên chủ nhiệm can thiệp nếu người gửi cố tình lặp lại. Em không cần chịu đựng chỉ để tránh bị chê là “không biết đùa”.",
  "legal": "Tôn trọng ranh giới cá nhân, quyền riêng tư và an toàn của học sinh; chưa đủ dữ kiện để xác định trách nhiệm pháp lý."
 },
 {
  "id": "DEV076",
  "question": "Bạn cứ đứng sát và chặn đường em để nói chuyện dù em muốn đi.",
  "assessment": "Bị chặn đường và đứng sát dù muốn rời đi.",
  "advice": "Nếu bạn đứng chắn lối và không để em đi, hãy nói rõ “Mình muốn đi, bạn tránh ra” khi an toàn, rồi tìm đến chỗ có giáo viên hoặc người lớn. Đừng cố tranh luận ở nơi vắng. Báo sự việc nếu hành vi tiếp diễn hoặc em thấy bị đe dọa.",
  "legal": "Tôn trọng ranh giới cá nhân, quyền riêng tư và an toàn của học sinh; chưa đủ dữ kiện để xác định trách nhiệm pháp lý."
 },
 {
  "id": "DEV077",
  "question": "Em đã block nhưng bạn tạo nick khác nhắn tiếp, hỏi em đang ở đâu và đi học đường nào.",
  "assessment": "Bị theo dõi trực tuyến qua nhiều tài khoản và hỏi đường đi.",
  "advice": "Việc tạo tài khoản mới để hỏi em đang ở đâu sau khi bị chặn là dấu hiệu cần cảnh giác. Đừng chia sẻ vị trí, lịch học hay tuyến đường; hãy lưu tin nhắn, siết quyền riêng tư và báo ngay gia đình, giáo viên. Nếu nghi bị theo dõi ngoài đời, cần có người lớn đi cùng.",
  "legal": "Tôn trọng ranh giới cá nhân, quyền riêng tư và an toàn của học sinh; chưa đủ dữ kiện để xác định trách nhiệm pháp lý."
 },
 {
  "id": "DEV078",
  "question": "Bạn trêu ghép đôi em với người khác mỗi ngày, em đã nói rất ngại mà vẫn tiếp tục.",
  "assessment": "Bị ghép đôi trêu chọc hằng ngày dù đã phản đối.",
  "advice": "Cô hiểu em ngại khi chuyện tình cảm bị đem ra trêu mỗi ngày. Em đã nói không thích, vậy các bạn cần dừng. Hãy nhắc lại ranh giới một cách rõ ràng và nhờ giáo viên chủ nhiệm hỗ trợ nếu họ tiếp tục; em không phải chứng minh điều gì về mối quan hệ của mình.",
  "legal": "Tôn trọng ranh giới cá nhân, quyền riêng tư và an toàn của học sinh; chưa đủ dữ kiện để xác định trách nhiệm pháp lý."
 },
 {
  "id": "DEV079",
  "question": "Một bạn hỏi chuyện riêng tư về cơ thể em trước nhiều người làm em xấu hổ.",
  "assessment": "Bị hỏi chuyện riêng tư về cơ thể trước đám đông.",
  "advice": "Em không có nghĩa vụ trả lời câu hỏi riêng tư về cơ thể trước nhiều người. Em có thể nói “Mình không muốn nói chuyện này” rồi rời đi. Nếu bạn tiếp tục làm em xấu hổ, hãy báo giáo viên để được bảo vệ quyền riêng tư và sự tôn trọng.",
  "legal": "Tôn trọng ranh giới cá nhân, quyền riêng tư và an toàn của học sinh; chưa đủ dữ kiện để xác định trách nhiệm pháp lý."
 },
 {
  "id": "DEV080",
  "question": "Em từng đùa kiểu nhắn tin làm bạn khó chịu. Bạn nói dừng rồi, em nên làm gì để tôn trọng ranh giới của bạn?",
  "assessment": "Người hỏi từng nhắn tin đùa quá giới hạn, muốn sửa.",
  "advice": "Khi bạn nói dừng, em hãy dừng ngay, xin lỗi cụ thể và không nhắn tiếp để đòi bạn phải trả lời. Đừng biện minh rằng mình chỉ đùa. Em có thể hỏi một lần xem bạn có muốn giữ khoảng cách không, rồi tôn trọng lựa chọn của bạn.",
  "legal": "Tôn trọng ranh giới cá nhân, quyền riêng tư và an toàn của học sinh; chưa đủ dữ kiện để xác định trách nhiệm pháp lý."
 },
 {
  "id": "DEV081",
  "question": "Em thấy mấy bạn đang vây một bạn ở cầu thang và chửi, em có nên chạy vào can ko?",
  "assessment": "Người chứng kiến thấy một bạn bị vây ở cầu thang.",
  "advice": "Em đừng lao vào giữa nhóm đang vây bạn vì có thể nguy hiểm cho cả hai. Hãy gọi ngay giáo viên, bảo vệ hoặc người lớn gần nhất, mô tả vị trí chính xác. Nếu an toàn, em có thể đứng ở khoảng cách phù hợp để hướng dẫn người lớn đến, không quay clip để đăng mạng.",
  "legal": "Tôn trọng ranh giới cá nhân, quyền riêng tư và an toàn của học sinh; chưa đủ dữ kiện để xác định trách nhiệm pháp lý."
 },
 {
  "id": "DEV082",
  "question": "Bạn thân nói với em đang bị dọa đánh nhưng bắt em hứa ko kể ai. Em nên giữ bí mật ko?",
  "assessment": "Bạn thân bị dọa đánh, yêu cầu giữ bí mật.",
  "advice": "Cô hiểu em muốn giữ lời hứa với bạn, nhưng khi có nguy cơ bị đánh thì an toàn quan trọng hơn bí mật. Em hãy nói với bạn rằng mình cần nhờ giáo viên hoặc cha mẹ giúp bảo vệ bạn ấy; có thể cùng bạn đi báo. Đừng tự tìm người đe dọa để giải quyết.",
  "legal": "Tôn trọng ranh giới cá nhân, quyền riêng tư và an toàn của học sinh; chưa đủ dữ kiện để xác định trách nhiệm pháp lý."
 },
 {
  "id": "DEV083",
  "question": "Em thấy clip bạn bị đánh trong gr lớp, nhiều người đang xin clip. Em nên làm gì?",
  "assessment": "Người chứng kiến nhận clip đánh nhau đang bị xin chia sẻ.",
  "advice": "Em đừng gửi clip cho người khác hoặc đăng lên mạng. Nếu clip giúp xác định nguy cơ hay người bị hại, hãy báo giáo viên và cung cấp bằng chứng qua kênh an toàn, không phát tán rộng. Hỏi thăm bạn bị đánh nếu an toàn và khuyên người khác ngừng xin clip.",
  "legal": "Tôn trọng ranh giới cá nhân, quyền riêng tư và an toàn của học sinh; chưa đủ dữ kiện để xác định trách nhiệm pháp lý."
 },
 {
  "id": "DEV084",
  "question": "Em từng share meme chế giễu một bạn, giờ mới biết bạn buồn và nghỉ học. Em muốn sửa.",
  "assessment": "Người hỏi từng chia sẻ meme, bạn bị hại nghỉ học.",
  "advice": "Em hãy dừng chia sẻ meme, xóa bài của mình và đề nghị những người đã nhận không phát tán tiếp. Xin lỗi bạn bằng lời chân thành, không ép bạn phải tha thứ. Vì bạn đã nghỉ học, hãy báo giáo viên chủ nhiệm để nhà trường hỗ trợ bạn ấy, không tự suy đoán lý do nghỉ.",
  "legal": "Tôn trọng ranh giới cá nhân, quyền riêng tư và an toàn của học sinh; chưa đủ dữ kiện để xác định trách nhiệm pháp lý."
 },
 {
  "id": "DEV085",
  "question": "Em là admin gr lớp, có người đăng ảnh xấu của bạn khác. Em nên xử lý bài đó sao?",
  "assessment": "Quản trị nhóm lớp thấy ảnh xấu của bạn bị đăng.",
  "advice": "Là quản trị nhóm, em nên gỡ hoặc ẩn bài vi phạm quy tắc nhóm, nhắc người đăng không chia sẻ lại và không biến việc xử lý thành một cuộc bêu tên công khai. Nếu nội dung nghiêm trọng, hãy báo giáo viên chủ nhiệm; giữ bằng chứng tối thiểu qua kênh an toàn nếu cần.",
  "legal": "Tôn trọng ranh giới cá nhân, quyền riêng tư và an toàn của học sinh; chưa đủ dữ kiện để xác định trách nhiệm pháp lý."
 },
 {
  "id": "DEV086",
  "question": "Bạn kể với em bị tẩy chay và nói ko muốn đi học nữa. Em có thể giúp bạn thế nào?",
  "assessment": "Bạn thân bị tẩy chay, không muốn đi học.",
  "advice": "Cô mừng vì em muốn ở bên bạn. Em hãy lắng nghe, tránh hứa giữ kín mọi chuyện và rủ bạn gặp giáo viên, người tư vấn học đường hoặc cha mẹ mà bạn tin tưởng. Nếu bạn nói muốn biến mất, không muốn sống hay có dấu hiệu tự làm hại mình, hãy hỏi nhẹ nhàng xem bạn có đang nghĩ đến tự làm hại bản thân không, báo người lớn ngay và đừng để bạn một mình khi có nguy cơ trước mắt.",
  "legal": "Tôn trọng ranh giới cá nhân, quyền riêng tư và an toàn của học sinh; chưa đủ dữ kiện để xác định trách nhiệm pháp lý."
 },
 {
  "id": "DEV087",
  "question": "Em chứng kiến hai bạn cãi nhau, một bạn bắt đầu dọa đánh. Em sợ báo cô sẽ bị nói là mách lẻo.",
  "assessment": "Người chứng kiến ngại bị gọi là mách lẻo.",
  "advice": "Báo người lớn khi có lời đe dọa đánh nhau là giúp ngăn nguy hiểm, không phải mách lẻo. Em hãy nói riêng với giáo viên hoặc bảo vệ trường về điều mình thấy, tránh đối đầu trực tiếp. Nếu hai bạn sắp xô xát, hãy gọi hỗ trợ ngay.",
  "legal": "Tôn trọng ranh giới cá nhân, quyền riêng tư và an toàn của học sinh; chưa đủ dữ kiện để xác định trách nhiệm pháp lý."
 },
 {
  "id": "DEV088",
  "question": "Em đã cùng mấy bạn gọi biệt danh làm một bạn khó chịu. Em muốn xin lỗi nhưng sợ bạn ko chấp nhận.",
  "assessment": "Người hỏi từng hùa theo gọi biệt danh, muốn xin lỗi.",
  "advice": "Em hãy xin lỗi vì đã cùng các bạn gọi biệt danh khiến người đó khó chịu, rồi dừng hẳn hành vi và nhắc nhóm không lặp lại. Nếu bạn chưa chấp nhận, em hãy tôn trọng cảm xúc của bạn. Cô tin sự thay đổi bền bỉ quan trọng hơn việc được tha thứ ngay.",
  "legal": "Tôn trọng ranh giới cá nhân, quyền riêng tư và an toàn của học sinh; chưa đủ dữ kiện để xác định trách nhiệm pháp lý."
 },
 {
  "id": "DEV089",
  "question": "Bạn gửi em ảnh riêng của người khác rồi bảo giữ bí mật. Em ko đăng nhưng có cần xóa ko?",
  "assessment": "Người chứng kiến được gửi ảnh riêng của người khác.",
  "advice": "Em đừng chuyển tiếp bức ảnh hay dùng nó để đùa cợt. Nếu ảnh riêng tư hoặc nhạy cảm được chia sẻ khi chưa có sự đồng ý, em hãy báo một người lớn đáng tin cậy để họ hướng dẫn cách yêu cầu gỡ và bảo vệ bạn trong ảnh. Không tải xuống, sao chép hay gửi lại ảnh nhạy cảm để làm bằng chứng; chỉ giữ thông tin về tài khoản, đường dẫn hoặc tin nhắn liên quan khi phù hợp.",
  "legal": "Tôn trọng ranh giới cá nhân, quyền riêng tư và an toàn của học sinh; chưa đủ dữ kiện để xác định trách nhiệm pháp lý."
 },
 {
  "id": "DEV090",
  "question": "Bạn thân nói bị bắt nạt và bảo “em chỉ muốn biến mất”. Em rất lo nhưng ko biết có nên báo người lớn ko.",
  "assessment": "Bạn thân nói “chỉ muốn biến mất” sau khi bị bắt nạt.",
  "advice": "Cô hiểu em lo cho bạn, và em nên báo ngay cho giáo viên, cha mẹ hoặc người lớn có thể đến giúp, dù bạn muốn giữ bí mật. Em có thể hỏi thẳng nhưng dịu dàng: “Bạn có đang nghĩ đến việc làm đau bản thân hay tự tử không?”. Nếu bạn có ý định, kế hoạch hoặc đang gặp nguy hiểm, đừng để bạn ở một mình; nhờ người lớn đưa bạn đến cơ sở y tế hoặc gọi 115 khi cần cấp cứu. Em không phải tự gánh trách nhiệm cứu bạn.",
  "legal": "Tôn trọng ranh giới cá nhân, quyền riêng tư và an toàn của học sinh; chưa đủ dữ kiện để xác định trách nhiệm pháp lý."
 },
 {
  "id": "DEV091",
  "question": "tụi nó cap đoạn chat riêng của e đăng gr, ghép ảnh e nữa, xong bảo mai ra cổng nói chuyện. e ko dám đi học thì sao",
  "assessment": "Bị lộ chat, ghép ảnh và hẹn ngoài cổng.",
  "advice": "Cô hiểu vì sao em sợ đi học: em vừa bị phát tán tin nhắn, ghép ảnh, vừa bị gọi ra cổng. Việc cần làm trước tiên là báo ngay cha mẹ, giáo viên và bảo vệ trường, nhờ người lớn sắp xếp đi học và về nhà an toàn; tuyệt đối không gặp nhóm đó một mình. Sau đó mới cùng người lớn lưu bằng chứng tin nhắn, đường dẫn và yêu cầu gỡ nội dung. Em không cần tự đối đầu để chứng minh mình không sợ.",
  "legal": "Tôn trọng ranh giới cá nhân, quyền riêng tư và an toàn của học sinh; chưa đủ dữ kiện để xác định trách nhiệm pháp lý."
 },
 {
  "id": "DEV092",
  "question": "Bạn A nói xấu em trên mạng, rủ người tẩy chay em rồi nhắn nếu em mách cô thì sẽ xử em.",
  "assessment": "Bị nói xấu, tẩy chay và dọa đánh nếu báo cô.",
  "advice": "Đây không chỉ là nói xấu mà còn có lời đe dọa nhằm ngăn em tìm hỗ trợ. Em hãy báo riêng cho giáo viên, cha mẹ hoặc ban giám hiệu, đưa bằng chứng và đề nghị giữ kín cách tiếp nhận thông tin ở mức phù hợp. Đừng đối chất hay đi gặp nhóm đó một mình.",
  "legal": "Tôn trọng ranh giới cá nhân, quyền riêng tư và an toàn của học sinh; chưa đủ dữ kiện để xác định trách nhiệm pháp lý."
 },
 {
  "id": "DEV093",
  "question": "e với bạn cãi nhau, e chửi trước, bạn lấy ảnh e đăng lên story rồi dọa gặp ngoài trường. Giờ e cũng có lỗi thì phải lm sao",
  "assessment": "Người hỏi từng chửi trước, sau đó bị đăng ảnh và dọa gặp.",
  "advice": "Em có thể nhận lỗi vì đã chửi trước mà vẫn có quyền được bảo vệ khỏi đe dọa và việc dùng ảnh để bêu xấu. Hãy ngừng tranh cãi, báo giáo viên và gia đình về lời hẹn, không gặp riêng. Sau khi an toàn, em có thể xin lỗi phần sai của mình và nhờ người lớn hỗ trợ giải quyết việc đăng ảnh.",
  "legal": "Tôn trọng ranh giới cá nhân, quyền riêng tư và an toàn của học sinh; chưa đủ dữ kiện để xác định trách nhiệm pháp lý."
 },
 {
  "id": "DEV094",
  "question": "Bạn em bị nhóm khác chế ảnh, kick khỏi nhóm học và mấy hôm nay có người đứng chờ gần cổng. Bạn bảo em đừng kể ai.",
  "assessment": "Người chứng kiến bạn bị chế ảnh, loại nhóm, có người chờ cổng.",
  "advice": "Bạn em đang gặp nhiều dấu hiệu đáng lo, nhất là việc có người chờ gần cổng. Em hãy báo ngay giáo viên, bảo vệ trường hoặc cha mẹ của bạn, dù bạn dặn đừng kể; giải thích rằng em làm vậy để bảo vệ bạn. Đừng tự theo dõi nhóm người chờ cổng hay đối đầu.",
  "legal": "Tôn trọng ranh giới cá nhân, quyền riêng tư và an toàn của học sinh; chưa đủ dữ kiện để xác định trách nhiệm pháp lý."
 },
 {
  "id": "DEV095",
  "question": "Em lỡ share tin đồn về bạn, bạn tức quá dọa tung ảnh riêng của em. Em biết mình sai nhưng em rất sợ.",
  "assessment": "Người hỏi đã chia sẻ tin đồn, rồi bị dọa tung ảnh riêng.",
  "advice": "Em cần dừng lan truyền tin đồn, đính chính và xin lỗi bạn vì phần sai của mình. Nhưng việc bạn đe dọa tung ảnh riêng vẫn không thể chấp nhận. Em đừng mặc cả hoặc gửi thêm ảnh; hãy lưu lời đe dọa và nhờ giáo viên, cha mẹ hỗ trợ bảo vệ em.",
  "legal": "Tôn trọng ranh giới cá nhân, quyền riêng tư và an toàn của học sinh; chưa đủ dữ kiện để xác định trách nhiệm pháp lý."
 },
 {
  "id": "DEV096",
  "question": "có nick lạ biết tên lớp, trường và đường e hay đi, cứ nhắn ‘tao biết m ở đâu’. e block thì nó tạo nick khác.",
  "assessment": "Nick lạ biết trường lớp, đường đi, liên tục đe dọa.",
  "advice": "Cô lo cho an toàn của em vì tài khoản lạ biết tuyến đường em đi và liên tục đe dọa. Em hãy báo ngay cha mẹ, giáo viên và bảo vệ trường, nhờ người lớn đi cùng hoặc đưa đón; tránh đi một mình trên đường quen thuộc nếu đang sợ bị theo dõi. Đừng trả lời, đừng đăng vị trí, hãy giữ thông tin tài khoản và tin nhắn. Nếu người đó xuất hiện, bám theo hoặc đe dọa trực tiếp, tìm nơi an toàn và nhờ người lớn gọi 113.",
  "legal": "Tôn trọng ranh giới cá nhân, quyền riêng tư và an toàn của học sinh; chưa đủ dữ kiện để xác định trách nhiệm pháp lý."
 },
 {
  "id": "DEV097",
  "question": "Bạn bắt em đưa tiền, nếu ko thì đăng clip em bị ngã và rủ mọi người cười. Em đã đưa 1 lần nhưng bạn vẫn đòi.",
  "assessment": "Bị đòi tiền nhiều lần bằng đe dọa đăng clip.",
  "advice": "Cô rất lo vì em bị ép đưa tiền nhiều lần bằng lời đe dọa tung clip. Em không nên tự đưa thêm tiền hay hẹn gặp để giải quyết. Hãy báo ngay cha mẹ, giáo viên và bảo vệ trường, giữ tin nhắn, thông tin chuyển tiền và đường dẫn clip nếu có. Nhờ người lớn giúp bảo vệ em khi đi lại và xử lý việc đòi tiền, yêu cầu gỡ clip; đừng tự phát tán clip để chứng minh sự việc.",
  "legal": "Tôn trọng ranh giới cá nhân, quyền riêng tư và an toàn của học sinh; chưa đủ dữ kiện để xác định trách nhiệm pháp lý."
 },
 {
  "id": "DEV098",
  "question": "Nhóm bạn ko cho em làm bài chung, lên mạng nói em vô dụng, hôm nay còn bảo tan học ở lại nói chuyện. Em nên ưu tiên làm gì trước?",
  "assessment": "Bị loại nhóm, xúc phạm trên mạng, hẹn ở lại sau giờ.",
  "advice": "Lúc này em hãy ưu tiên lời hẹn sau giờ học vì có thể tiềm ẩn nguy cơ. Đừng ở lại gặp nhóm một mình; báo giáo viên và cha mẹ để được hỗ trợ về nhà an toàn. Sau đó lưu bằng chứng về việc bị loại nhóm và xúc phạm để giáo viên giải quyết công bằng chuyện học tập.",
  "legal": "Tôn trọng ranh giới cá nhân, quyền riêng tư và an toàn của học sinh; chưa đủ dữ kiện để xác định trách nhiệm pháp lý."
 },
 {
  "id": "DEV099",
  "question": "Em thấy bạn bị nói xấu và tẩy chay, em vào bênh thì họ quay sang chửi và dọa cả em. Em có nên tiếp tục tranh luận ko?",
  "assessment": "Người chứng kiến bênh bạn rồi bị chửi và dọa.",
  "advice": "Em không cần tiếp tục tranh luận trong nhóm vì có thể khiến việc đe dọa tăng lên. Hãy lưu tin nhắn, ngừng phản hồi và báo giáo viên hoặc gia đình về việc cả em và bạn bị nhắm tới. Em vẫn có thể giúp bạn bằng cách đồng hành tìm hỗ trợ, không cần đối đầu công khai.",
  "legal": "Tôn trọng ranh giới cá nhân, quyền riêng tư và an toàn của học sinh; chưa đủ dữ kiện để xác định trách nhiệm pháp lý."
 },
 {
  "id": "DEV100",
  "question": "Bạn đăng đoạn chat riêng, sửa ảnh em thành ảnh nhạy cảm và nói mai tới trường sẽ cho em biết tay nếu em báo người lớn.",
  "assessment": "Bị đăng chat, ảnh nhạy cảm giả và đe dọa bạo lực.",
  "advice": "Cô rất lo cho em vì người khác đã đăng tin nhắn riêng, tạo ảnh nhạy cảm giả và dọa sẽ “cho em biết tay” vào ngày mai. An toàn là ưu tiên trước tiên: báo ngay cha mẹ, giáo viên, ban giám hiệu hoặc bảo vệ trường, nhờ người lớn đi cùng và không gặp người đe dọa một mình. Giữ tin nhắn và đường dẫn bài đăng, không chuyển tiếp ảnh nhạy cảm giả. Sau khi em được bảo vệ, nhờ người lớn giúp báo cáo nền tảng, yêu cầu gỡ và xử lý sự việc. Nếu có nguy hiểm trực tiếp, nhờ người lớn gọi 113.",
  "legal": "Tôn trọng ranh giới cá nhân, quyền riêng tư và an toàn của học sinh; chưa đủ dữ kiện để xác định trách nhiệm pháp lý."
 }
];
function reviewed100Match(text){
 const input=norm(text);
 if(!input)return null;
 const exact=REVIEWED_100.find(c=>norm(c.question)===input);
 if(exact)return exact;
 // Chỉ bắt lỗi gõ rất nhỏ; tránh gán nhầm tư vấn cho tình huống khác.
 const a=new Set(input.split(' ').filter(Boolean));
 const scored=REVIEWED_100.map(c=>{
  const b=new Set(norm(c.question).split(' ').filter(Boolean));
  const shared=[...a].filter(x=>b.has(x)).length;
  return {c,score:shared/Math.max(a.size,b.size,1)};
 }).sort((x,y)=>y.score-x.score);
 return scored[0]?.score>=0.94 && scored[0].score-(scored[1]?.score??0)>=0.08?scored[0].c:null;
}
function reviewed100Reply(text){
 const c=reviewed100Match(text);if(!c)return null;
 const high=/de doa|doa danh|tu tu|tu hai|danh nhau|anh nhay cam|xam hai|tong tien|cho em biet tay/.test(norm(text));
 return {
  support:c.advice,
  safe_steps:[],
  legal:{user_side:'Em có quyền được tôn trọng, bảo vệ và tìm kiếm sự hỗ trợ phù hợp. Không tự kết luận em có lỗi chỉ từ lời kể này.',other_side:c.legal,note:'Đây là định hướng giáo dục, không phải kết luận pháp lý. Nếu có nguy cơ trực tiếp, ưu tiên tìm người lớn và trợ giúp khẩn cấp.'},
  final_advice:'Cô mong em nhớ rằng việc tìm sự giúp đỡ khi cần là một cách bảo vệ bản thân và người khác. Em xứng đáng được tôn trọng và an toàn.',
  _diagnostics:{situation_summary:c.assessment,user_role:'Học sinh trong tình huống',actor_analysis:'Phân tích theo thông tin được kể; không suy đoán động cơ.',categories:[c.id],risk_level:high?'Cao':'Cần đánh giá theo bối cảnh',need_clarification:false,clarifying_question:''},
  _reference_case:c.id
 };
}

function fallback(text){
  const reviewed=reviewed100Reply(text);
  if(reviewed)return reviewed;
  const demo=approvedDemoReply(text);
  if(demo)return demo;
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
  const reviewed=reviewed100Reply(text);
  if(reviewed)return reviewed;
  const demo=approvedDemoReply(text);
  if(demo)return demo;
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

export function __testReviewed100(text){return reviewed100Reply(text);}
export function __testReviewedCases(){return REVIEWED_100;}
export function __testDemo(text){return approvedDemoReply(text);}
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

