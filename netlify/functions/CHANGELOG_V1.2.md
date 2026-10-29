# AI BẠO LỰC HỌC ĐƯỜNG – CHANGELOG V1.2

## Mục tiêu
V1.2 nâng cấp bộ não AI từ V1.1 dựa trên việc đối chiếu bộ kiểm thử 100 tình huống. Bộ 100 tình huống được giữ độc lập trong thư mục `tests/` để làm chuẩn kiểm định, không được nhét nguyên văn vào prompt như 100 câu trả lời mẫu.

## Thay đổi chính
1. Chuẩn hóa mức nguy cơ thành 7 mức: Thấp, Thấp-Trung bình, Trung bình, Trung bình-Cao, Cao, Rất cao, Chưa rõ.
2. Bổ sung suy luận đa vai trò và bản đồ chủ thể “ai làm gì với ai”.
3. Bổ sung quy tắc cho người chứng kiến, người tiếp tay và hành vi trả đũa.
4. Bổ sung xử lý câu không dấu, viết tắt, sai chính tả và câu kể lộn xộn.
5. Bổ sung phân biệt đùa/xung đột hai chiều với hành vi vượt ranh giới hoặc bắt nạt.
6. Bổ sung quy tắc ảnh/video/tin nhắn riêng/dữ liệu cá nhân: bằng chứng riêng ≠ phát tán công khai.
7. Bổ sung quy tắc đe dọa mơ hồ so với nguy cơ bạo lực sắp xảy ra.
8. Bổ sung ưu tiên an toàn khi có dấu hiệu tuyệt vọng/không an toàn nghiêm trọng.
9. Bổ sung tách nợ tiền khỏi bêu xấu/đe dọa/cưỡng ép.
10. Bổ sung phân vai trong cờ bạc: người chơi, người rủ rê/tiếp tay, người cho vay, người chứng kiến.
11. Bổ sung quy tắc vay trực tuyến/lừa đảo: không hướng dẫn vay/gỡ nợ; cảnh báo OTP, phí trước và dữ liệu cá nhân.
12. Cập nhật giao diện để mức “Trung bình-Cao” được đánh dấu/cộng vào nhóm cần chú ý cao.

## Quy trình kiểm định đề xuất
V1.1 -> Bộ 100 tình huống -> phân tích khoảng trống -> V1.2 -> triển khai thử -> chạy lại 100 tình huống -> chấm 5 tiêu chí -> PASS/FAIL -> sửa các case FAIL -> V1.3.

## Lưu ý khoa học
Bộ 100 tình huống là test suite độc lập. Không dùng nguyên văn các “Hướng phản hồi chuẩn” làm prompt hệ thống, để tránh biến kiểm thử thành học thuộc đáp án.
