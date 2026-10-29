# Cô giáo AI – bản cập nhật hội thoại mới

- Nút **Xóa hội thoại trên màn hình** đã có sẵn.
- Khi nhấn **Phân tích cùng AI** với tình huống mới, hệ thống tự xóa hội thoại cũ và chỉ hiển thị câu hỏi cùng tư vấn mới.
- Khi thay đổi câu hỏi trong lúc AI đang trả lời, yêu cầu cũ bị hủy để tránh hiện kết quả nhầm.
- Yêu cầu AI dùng `cache: no-store`; Netlify có thêm header kiểm tra bản HTML/JavaScript mới, hạn chế phải nhấn Ctrl+F5.
- Đây là chỉnh sửa mã nguồn, **chưa xác nhận triển khai trực tiếp trên Netlify**. Cần tải các file đã sửa lên GitHub, chờ Netlify deploy, rồi kiểm thử trên trang thật.
- **Kiểm thử:** (1) hỏi tình huống A; (2) nhập B và nhấn Phân tích; (3) xác nhận chỉ còn B và tư vấn B; (4) nhấn Xóa hội thoại; (5) tải lại trang bình thường bằng F5.
- Không đăng API key hoặc file `.env` lên GitHub.
