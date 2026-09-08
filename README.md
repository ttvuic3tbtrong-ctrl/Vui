# KHÔNG GIAN SỐ VĂN HÓA CÙNG AI – V1.3.1 HYBRID FREE

## Mục tiêu V1.3.1
Bản này sửa trọng tâm phản hồi cho học sinh theo 4 trụ cột:

1. **Động viên – ổn định tâm lý**
2. **Hướng giải quyết an toàn, sát tình huống**
3. **Góc nhìn pháp luật tách riêng người kể và đối phương**
4. **Lời khuyên cuối cùng**, cân nhắc ảnh hưởng tới bản thân, đối phương, gia đình, nhà trường và xã hội

Các thông tin kỹ thuật như vai trò, chủ thể, nhóm vấn đề và mức nguy cơ vẫn được phân tích ở phía sau để phục vụ bộ 100 tình huống kiểm thử, nhưng không hiển thị thành báo cáo khô cho học sinh.

## Sửa lỗi quan trọng
- Không còn bắt từ `anh` rồi hiểu nhầm thành "Ảnh & đời tư".
- Tách rõ tình huống: **em cho bạn mượn tiền → sau mới biết bạn đánh bài**. Người kể được xác định là **người cho vay/bị ảnh hưởng**, không phải người tham gia đánh bài.
- Cờ bạc + nợ được xếp mức **Cao** để khớp bộ 100 tình huống kiểm thử.
- Không đưa lời khuyên "gỡ bài/không phát tán" nếu tình huống không hề có ảnh, bài đăng hoặc nội dung riêng tư.
- Rule Engine là nguồn chuẩn cho phần xác định chủ thể; Gemini (nếu có) chỉ hỗ trợ diễn đạt tự nhiên hơn.

## Miễn phí / Hybrid
Không bắt buộc API trả phí.
- Không có `GEMINI_API_KEY`: chạy Rule Engine cục bộ miễn phí.
- Có Gemini Free Tier: Gemini hỗ trợ diễn đạt; Rules vẫn khóa phần xác định chủ thể/nguy cơ để giảm nhầm vai.
- Gemini lỗi/hết hạn mức: tự quay về Rules.

## Kiểm thử
Giữ nguyên file:
`tests/Bo_100_tinh_huong_kiem_thu_AI_bao_luc_hoc_duong_V1.xlsx`

Nên test trước 10 tình huống đại diện, sau đó mới chạy toàn bộ 100 tình huống.
