# CHANGELOG V1.3 – Hybrid Free

## Mục tiêu
Giảm phụ thuộc API trả phí để có thể mở rộng cho học sinh/cộng đồng và dùng trong cuộc thi.

## Thay đổi chính
- Bỏ phụ thuộc OpenAI SDK và `OPENAI_API_KEY`.
- Thêm **Rule-based Engine chạy miễn phí trên Netlify Function**: nếu không có khóa AI ngoài, ứng dụng vẫn phân tích và trả lời.
- Thêm **Gemini Free Tier** làm lớp hỗ trợ tùy chọn qua `GEMINI_API_KEY`.
- Mặc định dùng model ổn định `gemini-2.5-flash-lite` (có thể đổi bằng `GEMINI_MODEL`).
- Nếu Gemini hết hạn mức, lỗi mạng hoặc không cấu hình khóa: tự động quay về Rule-based Engine, website không bị ngừng.
- Giữ nguyên các quy tắc V1.2 rút ra từ bộ 100 tình huống: chủ thể/vai trò, đa vai trò, đe dọa mơ hồ, riêng tư, cờ bạc, nợ/vay, an toàn.
- Giữ kho pháp luật giới hạn; không tự bịa điều luật/mức phạt/tội danh.

## Kiến trúc
Người dùng → Netlify Function → (Gemini Free nếu có) → Chuẩn hóa bằng Rules → Kết quả
                                  ↘ lỗi/hết hạn mức → Rules cục bộ → Kết quả

## Lưu ý nghiên cứu
Bộ 100 tình huống vẫn là test suite độc lập. Không đưa đáp án chuẩn của 100 ca vào prompt.
