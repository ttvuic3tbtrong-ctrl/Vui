# Cập nhật AI tư vấn tình cảm học đường
Đã bổ sung bộ nhận diện ngữ cảnh tình cảm + lời hẹn riêng vào `netlify/functions/ai.mjs`.
Bộ 100 tình huống gốc được giữ nguyên; có 20 tình huống TC101–TC120 trong tài liệu Word riêng để giáo viên duyệt.
Kiểm thử tự động 6 trường hợp: PASS. Chưa kiểm thử website thật hoặc tất cả biến thể ngôn ngữ.

## Cách cập nhật
Chỉ thay `netlify/functions/ai.mjs` trong GitHub. Không xóa các file khác.
Sau khi Netlify Published, thử: “Em và bạn cùng quen một bạn trai nhưng bạn trai lại thích em nên bạn ấy muốn gặp riêng em để nói chuyện, có nên đi không ạ?”
Sau đó thử câu không liên quan: “Bạn rủ em đi công viên tập thể dục”.
