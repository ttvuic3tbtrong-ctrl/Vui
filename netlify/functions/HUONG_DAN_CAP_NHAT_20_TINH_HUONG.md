# Cập nhật 20 tình huống tình cảm đã duyệt (TC101–TC120)

Đã tích hợp đủ 20 lời tư vấn từ file Word được duyệt vào `netlify/functions/ai.mjs`. Website tư vấn một lượt; không hỏi chờ phản hồi tiếp. Với câu hỏi gần như trùng tình huống đã duyệt, trả lời theo đúng nội dung đã duyệt. Các tình huống mới tiếp tục dùng AI phân tích theo ngữ cảnh, không ép vào một câu trả lời chung.

## Cập nhật đơn giản
1. Giải nén ZIP, vào `Vui-main/netlify/functions` trên máy tính.
2. Trên GitHub vào đúng thư mục `netlify/functions` → `Add file` → `Upload files`.
3. Chỉ kéo `ai.mjs` và commit. KHÔNG kéo cả thư mục `Vui-main`.
4. Kiểm tra Netlify `Published`, rồi nhập lại trường hợp TC101 và một câu khác để xác minh AI tư vấn đúng trong một lượt.

Đã kiểm thử tự động 20 ví dụ gốc và 6 câu không trùng; chưa kiểm thử live trên Netlify. Không ghi API key vào GitHub.
