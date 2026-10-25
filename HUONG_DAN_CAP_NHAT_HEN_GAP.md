# Cập nhật nhận diện hẹn gặp sau mâu thuẫn
- Sửa file: `netlify/functions/ai.mjs`.
- Nhận diện tổ hợp: có mâu thuẫn + lời rủ/hẹn + địa điểm ngoài trường.
- Không mặc định bạn kia định đánh nhau; ưu tiên an toàn, gợi ý gặp tại trường có thầy cô.
- Có cảnh báo rõ hơn khi câu hỏi có đe dọa.
- Cả khi Gemini trả lời chung chung hoặc lỗi, quy tắc an toàn này vẫn được áp dụng.
- Đã chạy 6 kiểm thử tự động bằng `node tests/test_hen_gap.mjs`.
- Chưa kiểm thử trực tiếp website Netlify hoặc toàn bộ 100 tình huống.

## Cập nhật an toàn
1. Giải nén ZIP. Trên GitHub kho Vui, chọn Add file > Upload files.
2. Kéo nội dung bên trong thư mục Vui-main vào, KHÔNG kéo cả thư mục.
3. Kiểm tra đường dẫn `netlify/functions/ai.mjs` trước khi Commit changes.
4. Sau khi Netlify Published, mở trang mới và thử câu: 'Em và bạn em có mâu thuẫn nên bạn rủ em ra công viên để gặp mặt'.
