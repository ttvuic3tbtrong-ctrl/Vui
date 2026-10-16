# HƯỚNG DẪN CẬP NHẬT WEBSITE – BẢN LUYỆN THUYẾT TRÌNH

## Đã chỉnh trong mã nguồn
- Thêm menu 10 tình huống mẫu, trích từ bộ 100 tình huống kiểm thử; chọn mẫu sẽ điền vào ô hỏi, **không tự khẳng định AI trả lời đúng**.
- Thêm nút xóa hội thoại trên màn hình, hủy yêu cầu đang xử lý khi xóa.
- Chống hiển thị câu trả lời cũ sau khi học sinh đã xóa màn hình.
- Thêm phiên bản tài nguyên JS/CSS để giảm tình trạng trình duyệt giữ bản cũ.
- Làm rõ thống kê chỉ ở thiết bị đang dùng, không phải số lượt của tất cả học sinh.
- Kiểm tra giới hạn 3000 ký tự ở phía máy chủ.

## Cập nhật GitHub
1. Giữ một bản sao ZIP cũ.
2. Giải nén ZIP mới, mở thư mục `Vui-main` bên trong.
3. Trên GitHub, vào kho `Vui` và dùng Add file → Upload files để tải các file thay đổi lên đúng đường dẫn. **GitHub upload qua web có thể không thuận tiện với thư mục lồng nhau**; dùng GitHub Desktop để đồng bộ toàn bộ thư mục sẽ an toàn hơn.
4. Đảm bảo `netlify/functions/ai.mjs` nằm đúng thư mục như trước. Không tải nguyên file ZIP lên GitHub rồi kỳ vọng Netlify tự chạy từ ZIP.
5. Chờ Netlify báo deploy thành công, mở website ở cửa sổ ẩn danh để kiểm tra.
6. Không đưa `GEMINI_API_KEY` vào HTML/JS công khai. Khóa nếu có phải được cấu hình trong Netlify Environment variables.

## Kiểm tra trước khi học sinh dùng
- Mở trang trên điện thoại và máy tính; chuyển qua lại 4 mục.
- Chọn tình huống mẫu → nhấn Phân tích cùng AI → kiểm tra lời tư vấn có đúng vai trò, an toàn, không bịa luật.
- Chọn mẫu khác; thử xóa hội thoại ngay khi AI đang trả lời; không được hiện lại câu cũ.
- Thử nhập câu không dấu, câu viết tắt và câu mới.
- Với tình huống nguy cơ cao, học sinh phải tìm người lớn đáng tin cậy, không chỉ dựa vào AI.
- Kiểm tra 100 tình huống với phản hồi thực tế riêng trước khi tuyên bố đạt chuẩn.

## Kịch bản trình diễn 3 phút
1. 30 giây: giới thiệu vấn đề bạo lực học đường trên không gian mạng.
2. 30 giây: giới thiệu 2 phần Nhận biết và Tâm sự cùng AI.
3. 60 giây: chọn tình huống mẫu, đọc câu hỏi, trình diễn tư vấn; giải thích đúng vai trò và bước xử lý.
4. 30 giây: thử một tình huống mới không có sẵn.
5. 30 giây: trình bày giới hạn: AI là công cụ hỗ trợ, không thay giáo viên, phụ huynh hay cơ quan chuyên môn.

**Lưu ý:** Bản này là bản cải tiến kỹ thuật để luyện thuyết trình, không phải chứng nhận rằng website đã vượt qua 100 bài kiểm thử.
