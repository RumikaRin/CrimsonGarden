# Nguyên Tắc Thiết Kế UI/UX Chống Rập Khuôn (ui-ux.md)

Để tránh tạo ra các giao diện chung chung mang tính chất "AI viết" (AI slop), bắt buộc áp dụng bộ quy tắc thiết kế dưới đây.

---

## 1. CẤU HÌNH 3 TRỤC DIAL (THIẾT LẬP BAN ĐẦU)

Trước khi dựng layout, hãy phân tích yêu cầu để định vị 3 trục thiết kế:
*   `DESIGN_VARIANCE` (1 = Đối xứng hoàn hảo, 10 = Bố cục bất đối xứng sáng tạo). Mặc định: `8`.
*   `MOTION_INTENSITY` (1 = Tĩnh, 10 = Chuyển động vật lý mượt mà). Mặc định: `6`.
*   `VISUAL_DENSITY` (1 = Thoáng đãng kiểu nghệ thuật, 10 = Mật độ thông tin cao). Mặc định: `4`.

### 1.B Optional Preset Cho Landing Page

Nếu task là landing page/marketing page cinematic, có thể dùng preset
[../UI_PRESETS/CINEMATIC_LANDING_BUILDER.md](../UI_PRESETS/CINEMATIC_LANDING_BUILDER.md).
Preset này **không áp dụng** cho dashboard, admin, CRM hoặc SaaS operations UI.
H5S/RULE.md và design system hiện có luôn ưu tiên cao hơn preset.

---

## 2. MÀU SẮC & TYPOGRAPHY

*   **Bảng màu:** Tối đa 1 màu nhấn (accent color). Độ bão hòa của màu nhấn mặc định `< 80%`.
*   **Cấm bảng màu rập khuôn (Premium-Consumer Palette Ban):** Đối với các giao diện sang trọng/craft, cấm lạm dụng mặc định bảng màu `beige/cream + brass/clay + espresso text` (ví dụ nền `#f5f1ea`, chữ `#1a1714`). Hãy luân phiên sử dụng các bộ phối khác như: *Silver Grey + Chrome*, *Forest Green + Bone + Amber*, hoặc *Monochrome + pop color*.
*   **Cấm hiệu ứng phát sáng tím AI (The Lila Rule):** Cấm tự ý chèn các vầng sáng màu tím hoặc xanh neon giả lập AI vào nền tối.
*   **Typography:** Không sử dụng `Inter` làm mặc định cho mọi trang web. Hãy chọn `Geist`, `Satoshi`, `Outfit`, hoặc serif phù hợp.
*   **Phông chữ Serif:** Chỉ sử dụng khi thương hiệu có chỉ định cụ thể. Không lạm dụng phông chữ serif chỉ vì "nhìn cao cấp". Cấm sử dụng phông chữ `Fraunces` và `Instrument_Serif` làm phông chữ mặc định.

---

## 3. BỐ CỤC TRANG (LAYOUT CONSTRAINTS)

*   **Màn hình Hero:** 
    *   Phải nằm trọn trong viewport đầu tiên (`min-h-[100dvh]` thay vì `h-screen` để tránh giật trên di động).
    *   Padding phía trên cùng (Top padding) trên máy tính tối đa là `pt-24` (≈6rem).
    *   Tiêu đề (Headline) tối đa 2 dòng. Phụ đề (Subtext) tối đa 20 từ.
    *   Bắt buộc chứa CTA primary dễ thấy mà không cần cuộn trang.
    *   Cấm chèn danh sách logo khách hàng hoặc tagline phụ vào trong khu vực Hero. Logo khách hàng phải đặt ở một section riêng ngay phía dưới.
*   **Bố cục Bento Grid:** Phải có số ô tương xứng chính xác với số lượng nội dung cần hiển thị (ví dụ 3 nội dung -> 3 ô, không chèn ô trống). Ít nhất 2-3 ô trong bento grid phải có hình ảnh, pattern hoặc nền màu sắc thay đổi để tạo nhịp điệu thị giác.
*   **Chống lặp bố cục (Section-Layout-Repetition Ban):** Một kiểu layout (ví dụ: chia cột ảnh + chữ) chỉ được xuất hiện tối đa 1 lần trên trang. Nếu trang có 8 section, phải sử dụng ít nhất 4 kiểu layout khác nhau. Cấm thiết kế kiểu ziczac (ảnh-chữ rồi chữ-ảnh) quá 2 lần liên tiếp.

---

## 4. TƯƠNG TÁC & KHẢ NĂNG TIẾP CẬN (UX/A11y)

*   **Tactile Feedback:** Tất cả nút bấm khi `:active` phải có hiệu ứng nhấn vật lý nhẹ (`scale-[0.98]` hoặc `-translate-y-[1px]`).
*   **Độ tương phản (Button/Form Contrast):** Nút bấm và placeholder của input bắt buộc phải đạt độ tương phản tối thiểu WCAG AA (4.5:1 đối với văn bản thường). Cấm thiết kế chữ trắng trên nền nút vàng nhạt hoặc viền input mờ không nhìn rõ.
*   **Icon:** Sử dụng duy nhất một bộ icon cho toàn bộ dự án (ưu tiên `@phosphor-icons/react` hoặc `hugeicons-react`, tránh dùng `lucide-react` trừ khi dự án cũ đã cài). **Cấm tuyệt đối dùng emoji làm icon UI.**
*   **Hình ảnh:** Luôn sử dụng hình ảnh thực tế hoặc tạo ảnh chất lượng cao bằng AI (`generate_image`) để làm visual assets. Cấm tạo các ảnh chụp màn hình giả lập bằng các thẻ `div` lồng nhau.
