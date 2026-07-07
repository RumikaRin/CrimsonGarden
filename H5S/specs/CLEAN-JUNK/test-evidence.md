# Test Evidence: Dọn dẹp các file rác trong dự án (CLEAN-JUNK)

## 🧪 BẰNG CHỨNG XÁC MINH (VALIDATION EVIDENCE)

### Automated & Manual Verification

- [x] Lệnh `git status` xác nhận không còn file rác.
  - Các script Python debug ở root (`check_dims.py`, `check_json.py`, `check_pages.py`, v.v.) đã bị xóa hoàn toàn.
  - Các file dữ liệu/ảnh tạm (`debug_out.txt`, `parsed.json`, `scratch_img_*`, v.v.) đã bị xóa hoàn toàn.
  - Thư mục `tmp-qa/` chứa ~4000 screenshots và profile tạm đã được giải phóng hoàn toàn.
- [x] Dự án chạy bình thường.
  - Đã chạy typecheck: `npm run lint` và hoàn thành thành công.
  - Đã chạy build dự án: `npm run build` và biên dịch ứng dụng Next.js thành công.
