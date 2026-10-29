# Bản sửa 10 tình huống mẫu — 17/10/2026

- Đã viết lời tư vấn theo đúng 10 câu hỏi trong `demo-scenarios.js`.
- Mỗi lời tư vấn có phần chia sẻ cảm xúc riêng, ít nhất 4 bước xử lý, góc nhìn pháp luật theo tình huống và lời kết trọn vẹn.
- Áp dụng cho câu hỏi mẫu trùng nội dung sau chuẩn hóa dấu câu/chữ hoa. Với cách diễn đạt khác, hệ thống vẫn dựa vào Gemini hoặc logic dự phòng, **chưa đảm bảo mọi biến thể đều được xử lý như mẫu**.
- Chưa thể thao tác nhập câu trực tiếp qua giao diện Netlify trong môi trường kiểm thử này; các phép thử là kiểm thử hàm mã nguồn cục bộ.
- Đã kiểm thử: 10 mẫu + 1 đối chứng, 20 tình huống tình cảm + 5 đối chứng, 6 tình huống hẹn gặp, 6 tình huống tình cảm.
- **Chưa kiểm duyệt đầy đủ cả 100 tình huống gốc**. Cần kiểm thử từng trường hợp trên website thật trước khi trình diễn.

## Cách cập nhật
1. Chỉ lấy file `netlify/functions/ai.mjs` trong gói này.
2. Vào GitHub `Vui/netlify/functions`, chọn Add file > Upload files và tải lên duy nhất `ai.mjs`.
3. Kiểm tra đúng đường dẫn, Commit changes.
4. Đợi Netlify Published đúng commit mới.
5. Mở website, chọn 10 mẫu và nhấn Phân tích cùng AI, chụp lại các câu có vấn đề.
