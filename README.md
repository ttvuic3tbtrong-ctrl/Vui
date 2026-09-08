# KHÔNG GIAN SỐ VĂN HÓA CÙNG AI – V1.3 HYBRID FREE

## Cấu trúc sản phẩm
1. NHẬN BIẾT
2. TÂM SỰ CÙNG AI
3. THỐNG KÊ

## Điểm mới V1.3
Ứng dụng **không còn bắt buộc API trả phí**. Netlify Function có một bộ phân tích Rule-based cục bộ, vì vậy chức năng “Tâm sự cùng AI” vẫn hoạt động khi chưa cấu hình khóa AI ngoài.

Có thể thêm **Gemini Free Tier** để tăng khả năng hiểu ngôn ngữ tự nhiên:
- Netlify > Environment variables
- `GEMINI_API_KEY` = khóa tạo từ Google AI Studio
- tùy chọn `GEMINI_MODEL` = `gemini-2.5-flash-lite`
- Redeploy site

Không đưa API key vào `index.html`, `app.js`, GitHub hoặc ảnh chụp màn hình.

## Cơ chế dự phòng
- Có Gemini key và còn hạn mức: Gemini hỗ trợ phân tích → Rules chuẩn hóa/an toàn.
- Không có key / Gemini lỗi / hết hạn mức: Rules cục bộ tự xử lý → website vẫn trả lời.

## Bộ não V1.3
- Phân tích ai đang chat, ai thực hiện hành vi, hành vi hướng tới ai.
- Cho phép đa vai trò.
- Hỗ trợ câu không dấu/sai chính tả ở mức quy tắc.
- Không cổ vũ trả đũa, hack, phát tán riêng tư, cờ bạc, vay để gỡ nợ.
- Nguy cơ cao: ưu tiên người lớn có trách nhiệm.
- Đe dọa mơ hồ: hỏi thêm thay vì tự nâng mức quá cao.
- Pháp luật chỉ dùng kho căn cứ giới hạn trong `netlify/functions/ai.mjs`.

## Kiểm thử khoa học
Dùng file `tests/Bo_100_tinh_huong_kiem_thu_AI_bao_luc_hoc_duong_V1.xlsx` để chấm độc lập:
- Đúng chủ thể
- Đúng vai trò
- Đúng vấn đề
- Hỗ trợ phù hợp
- Pháp luật đúng/không bịa

Quy trình: V1.3 → chạy 100 tình huống → PASS/FAIL → phân tích lỗi → V1.4.
