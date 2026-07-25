# Bảng Chống Biện Minh (ANTI_RATIONALIZATION.md)

Tài liệu này liệt kê các lý do **Agent thường viện ra để bỏ qua bước quan trọng** trong quy trình phát triển, kèm theo phản bác bắt buộc. Agent phải đối chiếu với bảng này trước khi quyết định bỏ qua bất kỳ bước nào.

> **Nguyên tắc vàng:** Nếu bạn đang nghĩ đến lý do để bỏ qua một bước, bạn có thể đang biện minh.

---

## 🧪 BƯỚC: VIẾT TEST

| # | Lý Do Agent Thường Nêu | Phản Bác |
| :--- | :--- | :--- |
| 1 | "Code quá đơn giản, không cần test" | Code đơn giản hôm nay có thể phức tạp ngày mai. Test giúp phát hiện regression khi refactor. |
| 2 | "Chỉ thay đổi UI, test không cần thiết" | UI cũng cần test: render đúng không, state đúng không, event handler hoạt động không. |
| 3 | "Sẽ viết test sau khi feature hoàn chỉnh" | "Sau" thường không bao giờ đến. TDD yêu cầu test trước hoặc song song với code. |
| 4 | "Hệ thống test chưa setup" | Đó là lý do để setup, không phải lý do để bỏ qua. Báo cáo Leader để xử lý. |
| 5 | "Test cũ đã cover đủ" | Xác minh: test cũ có bao phủ thay đổi mới không? Chạy thử để chắc chắn. |

---

## 📋 BƯỚC: VIẾT ĐẶC TẢ (/spec)

| # | Lý Do Agent Thường Nêu | Phản Bác |
| :--- | :--- | :--- |
| 1 | "Yêu cầu đã rõ ràng, không cần spec" | Spec không chỉ để hiểu yêu cầu — nó ghi nhận scope, acceptance criteria, và edge case. |
| 2 | "Task nhỏ, viết spec mất thời gian" | Spec cho task nhỏ chỉ cần 3-5 dòng. Thời gian viết < thời gian debug khi hiểu sai. |
| 3 | "Người dùng muốn nhanh" | Nhanh nhưng sai thì phải làm lại. Spec 5 phút có thể tiết kiệm 2 giờ sửa lỗi. |

---

## 🔍 BƯỚC: REVIEW CODE (/review)

| # | Lý Do Agent Thường Nêu | Phản Bác |
| :--- | :--- | :--- |
| 1 | "Code đã pass test, không cần review" | Test pass không đảm bảo code tốt. Security issue, performance leak, convention violation đều cần mắt review. |
| 2 | "Tôi (Coder) đã tự review rồi" | Tự review = thiên lệch xác nhận (confirmation bias). Review phải do Agent khác thực hiện. |
| 3 | "Chỉ sửa 1-2 dòng, không đáng review" | 1 dòng sai có thể gây security breach. SQL injection, XSS chỉ cần 1 dòng. |

---

## 📐 BƯỚC: LẬP KẾ HOẠCH (/plan)

| # | Lý Do Agent Thường Nêu | Phản Bác |
| :--- | :--- | :--- |
| 1 | "Tôi biết cách làm, không cần plan" | Plan không phải cho bạn biết cách — nó giúp bạn không quên bước, và người khác đọc được tiến trình. |
| 2 | "Plan cứng nhắc, tôi cần linh hoạt" | Plan có thể cập nhật. Không có plan = không biết đang ở đâu khi gặp vấn đề. |
| 3 | "Feature đủ nhỏ để code trực tiếp" | Nếu feature có > 1 file thay đổi, plan giúp tránh quên file và phá scope. |

---

## 🔒 BƯỚC: SECURITY REVIEW

| # | Lý Do Agent Thường Nêu | Phản Bác |
| :--- | :--- | :--- |
| 1 | "Không có user input, không cần security review" | Mọi API endpoint đều có input. Header, cookie, query param đều là attack vector. |
| 2 | "Framework đã xử lý security" | Framework giảm rủi ro, không loại bỏ. Misconfiguration, logic flaw vẫn có thể xảy ra. |
| 3 | "Đây là internal tool, không ai tấn công" | Internal tool bị compromise = lateral movement. Zero trust là tiêu chuẩn. |

---

## 🚀 BƯỚC: CHẠY BUILD/LINT TRƯỚC KHI SHIP

| # | Lý Do Agent Thường Nêu | Phản Bác |
| :--- | :--- | :--- |
| 1 | "Code chạy đúng ở local, không cần build" | Build kiểm tra type error, import sai, tree-shaking issue mà dev server bỏ qua. |
| 2 | "Lint warnings không quan trọng" | Warnings hôm nay = errors ngày mai. Fix sớm khi context còn tươi. |
| 3 | "Build quá lâu, tốn thời gian" | Build lâu = vấn đề cần giải quyết, không phải lý do để bỏ qua. |

---

## ✅ CÁCH SỬ DỤNG

1. **Trước khi bỏ qua bất kỳ bước nào**, Agent mở file này và đọc bảng tương ứng.
2. **Nếu lý do của Agent trùng với bảng**, Agent **bắt buộc phải thực hiện bước đó**.
3. **Nếu lý do của Agent KHÔNG trùng**, Agent ghi lý do vào `AGENT_LOG.md` để Leader/người dùng đánh giá.
4. **Reviewer kiểm tra:** Trong báo cáo review, Reviewer phải xác nhận Coder đã thực hiện đủ bước hay có bỏ qua.
