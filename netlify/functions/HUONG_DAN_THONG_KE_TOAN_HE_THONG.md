# Cô giáo AI – thống kê toàn hệ thống

## Cập nhật
- `app.js`: gửi sự kiện lượt mở và lượt tư vấn tới Netlify Function, hiển thị tổng toàn hệ thống.
- `netlify/functions/stats.mjs`: lưu từng sự kiện vào Netlify Blobs, không lưu nội dung tâm sự, địa chỉ IP hay danh tính học sinh trong bản ghi.
- `index.html`: sửa nhãn thống kê và bỏ nút xóa thống kê.
- `package.json`: thêm `@netlify/blobs`.

## Cách triển khai (quan trọng)
1. Sao lưu mã nguồn website hiện tại và xuất/ghi nhận số liệu thống kê cũ trước khi thay.
2. Giải nén ZIP, mở thư mục `Vui-main`. Nếu đang triển khai bằng GitHub, thay các tệp trong thư mục gốc repository bằng nội dung trong `Vui-main`, sau đó commit/push. Netlify phải build từ repository để cài dependency và deploy Functions.
3. Trong Netlify, kiểm tra build/deploy thành công và Netlify Functions có hàm `stats` và `ai`. Không dùng cách kéo-thả chỉ riêng `index.html` hay chỉ các file tĩnh, vì hàm backend sẽ không được triển khai.
4. Mở website bằng cửa sổ ẩn danh, vào Thống kê: số lượt mở toàn hệ thống tăng sau một phiên mới; gửi một tình huống và chờ AI trả lời thành công: lượt tư vấn tăng 1. Kiểm tra trên thiết bị thứ hai để xác nhận hai thiết bị thấy cùng tổng số.
5. Nếu hiện `Chưa kết nối được thống kê hệ thống`, mở Netlify > Logs > Functions > stats để xem lỗi. Kiểm tra `@netlify/blobs` được cài và site hỗ trợ Blobs.

## Giới hạn cần biết
- Bộ đếm mới bắt đầu từ lúc triển khai; dữ liệu `localStorage` cũ trên từng máy không được nhập tự động.
- Số lượt mở = phiên trình duyệt, không phải số người duy nhất; lượt tư vấn = câu trả lời AI thành công được ghi nhận.
- Trang thống kê đang công khai. Người truy cập có thể tạo lượt sử dụng giả; không dùng số đếm như chứng cứ định danh học sinh.
- Thống kê hiện có thể chậm khi số sự kiện rất lớn vì cần đọc nhiều bản ghi; phù hợp thử nghiệm quy mô nhỏ. Khi triển khai quy mô lớn, nên chuyển sang database có tổng hợp theo ngày và cơ chế chống lạm dụng.
- Không nhập nội dung tâm sự hoặc thông tin cá nhân vào bảng thống kê.
