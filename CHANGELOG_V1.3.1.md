# CHANGELOG V1.3.1

## Thay đổi giao diện phản hồi
Từ 7 khối kỹ thuật xuống còn 4 khối dành cho học sinh:
1. Mình cùng bình tĩnh nhé
2. Em nên giải quyết thế nào?
3. Điều cần biết về pháp luật
4. Lời khuyên dành cho em

## Sửa Rule Engine
- Dùng regex có ranh giới từ thay cho `includes("anh")`, tránh nhận nhầm từ "bạn" thành nhóm ảnh/đời tư.
- Thêm nhận diện vai trò người cho vay/bị ảnh hưởng, người vay/đánh bạc và người chứng kiến.
- Thêm nhánh riêng cho cờ bạc + nợ theo bộ 100 tình huống.
- Thêm nhóm lừa đảo trực tuyến.
- Chỉ khuyên lưu/gỡ nội dung khi thật sự có ảnh, bài đăng, video, tin nhắn riêng hoặc nội dung bị phát tán.
- Tách góc pháp luật: người kể / đối phương / lưu ý.
- Giữ diagnostics ẩn để phục vụ chấm 100 tình huống.

## Regression test chính
Tình huống:
"Em cho bạn mượn 500 nghìn, sau mới biết bạn dùng tiền đó đánh bài online và đã thua, không có tiền trả."

Kỳ vọng:
- Người kể = người cho vay/bị ảnh hưởng
- Người kia = người đánh bài + người nợ
- Vấn đề = Tiền bạc/nợ + Cờ bạc trực tuyến
- Nguy cơ = Cao
- Không gán "Ảnh & đời tư"
- Không nói người kể đã tham gia đánh bạc
