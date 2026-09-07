# KHÔNG GIAN SỐ VĂN HÓA CÙNG AI – V1.0

## Cấu trúc sản phẩm
1. NHẬN BIẾT
2. TÂM SỰ CÙNG AI
3. THỐNG KÊ

## Chạy/deploy trên Netlify
1. Đưa toàn bộ thư mục này lên GitHub repository mới.
2. Kết nối repository đó với Netlify.
3. Trong Netlify > Site configuration > Environment variables:
   - tạo `OPENAI_API_KEY` = API key của dự án OpenAI.
   - tùy chọn `OPENAI_MODEL` = `gpt-5.6`.
4. Deploy lại site.
5. Mở tab "Tâm sự cùng AI" và nhập tình huống thử.

KHÔNG đưa API key vào index.html/app.js hoặc commit lên GitHub.

## Bộ não V1.0
- Phân tích ai đang chat, ai thực hiện hành vi, hành vi hướng tới ai.
- Cho phép đa vai trò.
- 7 tầng phản hồi: Nhận diện > Phân tích > Lắng nghe > Việc nên làm > Ứng xử văn hóa > Góc pháp luật > Lời khuyên.
- Khi thiếu dữ kiện: hỏi thêm thay vì đoán.
- Nguy cơ cao: ưu tiên tìm hỗ trợ từ người lớn có trách nhiệm.
- Pháp luật V1.0 chỉ dùng kho căn cứ đã kiểm chứng trong `netlify/functions/ai.mjs`; không cho AI tự bịa điều luật/mức phạt.

## Pháp luật V1.0
Kho hiện mới cố ý giới hạn ở các căn cứ đã kiểm chứng:
- Bộ luật Dân sự 2015: Điều 32 (hình ảnh), Điều 34 (danh dự, nhân phẩm, uy tín).
- Luật An ninh mạng 2018: Điều 29 (bảo vệ trẻ em trên không gian mạng).
- Nghị định 56/2017/NĐ-CP: Điều 36 (bí mật đời sống riêng tư trẻ em trên môi trường mạng).

Các nhóm đánh bạc, vay trực tuyến, đe dọa... hiện AI chỉ được cảnh báo "có thể liên quan pháp luật" và KHÔNG được tự nêu mức phạt/tội danh cho đến khi kho pháp luật được mở rộng, rà soát.

## Thống kê
V1.0 dùng localStorage trên từng thiết bị để test giao diện, không tải lời tâm sự lên dashboard.
Phiên bản nghiên cứu thật nên thiết kế thống kê tổng hợp/ẩn danh với quy trình đồng thuận và bảo vệ dữ liệu phù hợp.

## Kiểm thử
Dùng file Excel `Bo_100_tinh_huong_kiem_thu_AI_bao_luc_hoc_duong_V1.xlsx` đã tạo riêng để chấm:
- Đúng chủ thể
- Đúng vai trò
- Đúng vấn đề
- Hỗ trợ phù hợp
- Pháp luật đúng/không bịa

---

## Cập nhật V1.2 – kiểm định bằng 100 tình huống
- Bộ kiểm thử nằm tại `tests/Bo_100_tinh_huong_kiem_thu_AI_bao_luc_hoc_duong_V1.xlsx`.
- Test suite không được đưa nguyên văn vào system prompt.
- V1.2 bổ sung suy luận đa vai trò, chủ thể/hành vi, câu không dấu, đe dọa mơ hồ, quyền riêng tư, cờ bạc/nợ/vay và chuẩn hóa 7 mức nguy cơ.
- Sau khi triển khai, chạy đủ 100 tình huống và chấm theo 5 cột tiêu chí trong file test để đo PASS/FAIL.
