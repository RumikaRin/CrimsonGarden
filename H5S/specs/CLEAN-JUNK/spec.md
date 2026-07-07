# Spec: Dọn dẹp các file rác trong dự án (CLEAN-JUNK)

Dọn dẹp các file tạm, log, ảnh debug và script phụ trợ không còn sử dụng để làm sạch workspace và giảm kích thước thư mục dự án.

## User Review Required

> [!IMPORTANT]
> - Các file script python và file tạm ở thư mục gốc sẽ bị xóa vĩnh viễn. 
> - Thư mục `tmp-qa/` chứa hàng ngàn screenshot/profile cache của Playwright/Chrome/Edge (khoảng 4000+ files) sẽ bị xóa hoàn toàn.
> - Các file nguồn thiết yếu như [docx_parser.py](file:///d:/ProjectZ/Crimsonacademy/src/lib/docx_parser.py) và [pdf_parser.py](file:///d:/ProjectZ/Crimsonacademy/src/lib/pdf_parser.py) **được giữ lại** vì chúng thuộc về tính năng trích xuất tài liệu (DOC-EXTRACTION).

## Proposed Changes

### [Dọn dẹp thư mục gốc]

#### [DELETE] [check_dims.py](file:///d:/ProjectZ/Crimsonacademy/check_dims.py)
#### [DELETE] [check_json.py](file:///d:/ProjectZ/Crimsonacademy/check_json.py)
#### [DELETE] [check_pages.py](file:///d:/ProjectZ/Crimsonacademy/check_pages.py)
#### [DELETE] [check_word_json.py](file:///d:/ProjectZ/Crimsonacademy/check_word_json.py)
#### [DELETE] [check_word_json2.py](file:///d:/ProjectZ/Crimsonacademy/check_word_json2.py)
#### [DELETE] [debug_docx.py](file:///d:/ProjectZ/Crimsonacademy/debug_docx.py)
#### [DELETE] [debug_out.txt](file:///d:/ProjectZ/Crimsonacademy/debug_out.txt)
#### [DELETE] [describe_imgs.py](file:///d:/ProjectZ/Crimsonacademy/describe_imgs.py)
#### [DELETE] [extract_imgs.py](file:///d:/ProjectZ/Crimsonacademy/extract_imgs.py)
#### [DELETE] [fix_pdf_images.py](file:///d:/ProjectZ/Crimsonacademy/fix_pdf_images.py)
#### [DELETE] [pdf_to_word.py](file:///d:/ProjectZ/Crimsonacademy/pdf_to_word.py)
#### [DELETE] [parsed.json](file:///d:/ProjectZ/Crimsonacademy/parsed.json)
#### [DELETE] [parsed_word.json](file:///d:/ProjectZ/Crimsonacademy/parsed_word.json)
#### [DELETE] [test_gemini.cjs](file:///d:/ProjectZ/Crimsonacademy/test_gemini.cjs)
#### [DELETE] [test_order.py](file:///d:/ProjectZ/Crimsonacademy/test_order.py)
#### [DELETE] [Q162_img.jpg](file:///d:/ProjectZ/Crimsonacademy/Q162_img.jpg)
#### [DELETE] [Q163_img.jpg](file:///d:/ProjectZ/Crimsonacademy/Q163_img.jpg)
#### [DELETE] [scratch_img_162.jpg](file:///d:/ProjectZ/Crimsonacademy/scratch_img_162.jpg)
#### [DELETE] [scratch_img_163.jpg](file:///d:/ProjectZ/Crimsonacademy/scratch_img_163.jpg)
#### [DELETE] [scratch_img_164.jpg](file:///d:/ProjectZ/Crimsonacademy/scratch_img_164.jpg)
#### [DELETE] [scratch_img_165.jpg](file:///d:/ProjectZ/Crimsonacademy/scratch_img_165.jpg)
#### [DELETE] [scratch_img_166.jpg](file:///d:/ProjectZ/Crimsonacademy/scratch_img_166.jpg)
#### [DELETE] [tmp-qa/](file:///d:/ProjectZ/Crimsonacademy/tmp-qa)

## Verification Plan

### Manual Verification
- Chạy `git status` sau khi xóa để xác nhận thư mục gốc sạch sẽ và không làm ảnh hưởng đến các file source chính.
- Chạy `npm run dev` để đảm bảo dự án vẫn khởi động bình thường.
