import sys
import os
import pypdf
import re
import json
import base64
import io
try:
    from PIL import Image as PILImage
    HAS_PILLOW = True
except ImportError:
    HAS_PILLOW = False

DIACRITICS = "áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊỀẾỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸÝ"
V_LETTERS = "a-zA-ZđĐ" + DIACRITICS

V_INITIALS = r'(?:[Nn][Gg][Hh]|[Nn][Gg]|[Nn][Hh]|[Cc][Hh]|[Tt][Rr]|[Pp][Hh]|[Gg][Ii]|[Gg][Hh]|[Kk][Hh]|[Tt][Hh]|[VvDdĐdđGgHhKkLlMmNnPpRrSsTtxXBbCcQq])?'
V_CHAR = r'[aàáảãạăằắẳẵặâầấẩẫậeèéẻẽẹêềếểễệiìíỉĩịoòóỏõọôồốổỗộơờớởỡợuùúủũụưừứửữựyỳýỷỹỵAÀÁẢÃẠĂẰẮẲẴẶEÈÉẺẼẸÊỀẾỂỄỆIÌÍỈĨỊOÒÓỎÕỌÔỐỒỔỖỘƠỜỚỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲÝỶỸÝ]'
V_PART = f'(?:{V_CHAR}{{1,3}})'
V_FINALS = f'(?:[Nn][Gg]|[Nn][Hh]|[Cc][Hh]|[CcmntpCMNTP])?(?!{V_CHAR})'
SYLLABLE_PATTERN = re.compile(V_INITIALS + V_PART + V_FINALS)

ENGLISH_WORDS = {
    'server', 'client', 'root', 'dns', 'unknow', 'unknown', 'peer', 'to', 'based', 'ip',
    'set', 'type', 'mx', 'ns', 'soa', 'cname', 'nslookup', 'internet', 'tcp', 'udp',
    'protocol', 'web', 'http', 'https', 'ftp', 'smtp', 'dhcp', 'domain', 'host',
    'ping', 'port', 'router', 'switch', 'hub', 'network', 'packet', 'data', 'user'
}

def is_english_word(token):
    clean = re.sub(r'[^a-zA-Z]', '', token).lower()
    return clean in ENGLISH_WORDS

def segment_word(word):
    if len(word) <= 4:
        return word
    
    # Strip leading and trailing non-alphabetic characters
    match = re.match(r'^([^' + V_LETTERS + r']*)(.*?)([^' + V_LETTERS + r']*)$', word)
    if not match:
        return word
        
    leading, core, trailing = match.groups()
    if not core or len(core) <= 4:
        return word
        
    # Check if the core contains at least one diacritic character
    has_diacritic = any(c in DIACRITICS for c in core)
    if not has_diacritic:
        return word
        
    syllables = SYLLABLE_PATTERN.findall(core)
    if syllables and "".join(syllables) == core:
        return leading + " ".join(syllables) + trailing
    return word

def merge_vietnamese_spaces(text):
    text = re.sub(r' {2,}', ' \x00 ', text)
    tokens = text.split(' ')
    
    INITIAL_CONSONANTS = {
        'b', 'c', 'd', 'đ', 'g', 'h', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'x',
        'ch', 'gh', 'gi', 'kh', 'ng', 'nh', 'ph', 'th', 'tr'
    }
    
    # Pre-pass: merge single initial consonants to the right if the next token starts with a vowel
    i = 0
    temp_tokens = []
    while i < len(tokens):
        token = tokens[i]
        if token == '\x00':
            temp_tokens.append(token)
            i += 1
            continue
            
        # Check if token is a single consonant or initial cluster
        is_consonant = (token.lower() in INITIAL_CONSONANTS) or (
            len(token) == 1 and token.isalpha() and not any(v in token.lower() for v in 'aeiouyâăêôơưáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ')
        )
        
        if is_consonant and i < len(tokens) - 1:
            next_token = tokens[i+1]
            if next_token != '\x00' and next_token:
                # Check if next_token starts with a vowel
                starts_with_vowel = any(next_token[0].lower() == v for v in 'aeiouyâăêôơưáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ')
                if starts_with_vowel:
                    # Merge current consonant to the right
                    tokens[i+1] = token + next_token
                    i += 1
                    continue
                    
        temp_tokens.append(token)
        i += 1
    tokens = temp_tokens
    
    result = []
    SPECIAL_CLUSTERS = {'ng', 'nh', 'ch', 'tr', 'ph', 'gi', 'kh', 'th', 'gh'}
    
    for token in tokens:
        if not token:
            continue
        if not result:
            result.append(token)
            continue
            
        prev = result[-1]
        should_merge = False
        
        if prev != '\x00' and token != '\x00':
            # Do not merge if either token is a known English word
            if not is_english_word(prev) and not is_english_word(token):
                clean_prev = re.sub(r'[^a-zA-ZđĐ' + DIACRITICS + r']', '', prev)
                clean_token = re.sub(r'[^a-zA-ZđĐ' + DIACRITICS + r']', '', token)
                
                if clean_prev and clean_token:
                    # Do not merge choice markers/list numbers (e.g. A. or *B. or 1.)
                    if not re.match(r'^\*?[a-zA-Z0-9]+\.$', prev) and not re.match(r'^\*?[a-zA-Z0-9]+\.$', token):
                        # Do not merge if clean_prev contains a vowel and ends with a consonant, and clean_token starts with a vowel
                        VOWELS = set("aàáảãạăằắẳẵặâầấẩẫậeèéẻẽẹêềếểễệiìíỉĩịoòóỏõọôồốổỗộơớờởỡợuùúủũụưừứửữựyỳýỷỹỵAÀÁẢÃẠĂẰẮẲẴẶEÈÉẺẼẸÊỀẾỂỄỆIÌÍỈĨỊOÒÓỎÕỌÔỐỒỔỖỘƠỜỚỞỠỢÚÙỦŨỤƯỪỨỬỮỰÝỲÝỶỸÝ")
                        clean_prev_has_vowel = any(c in VOWELS for c in clean_prev)
                        clean_prev_ends_with_vowel = clean_prev[-1] in VOWELS
                        clean_token_starts_with_vowel = clean_token[0] in VOWELS
                        
                        if clean_prev_has_vowel and not clean_prev_ends_with_vowel and clean_token_starts_with_vowel:
                            pass # Do not cross closed syllable boundary (e.g. "đang ở", "đáp án")
                        else:
                            # Only merge if at least one of the clean tokens is a single character or a special cluster
                            at_least_one_is_small = (
                                len(clean_prev) == 1 or 
                                len(clean_token) == 1 or 
                                clean_prev.lower() in SPECIAL_CLUSTERS or 
                                clean_token.lower() in SPECIAL_CLUSTERS
                            )
                            
                            if at_least_one_is_small:
                                # Rule 1: Both are single letters
                                if len(clean_prev) == 1 and len(clean_token) == 1:
                                    should_merge = True
                                # Rule 2: Right token is a single letter, and left ends with a letter
                                elif len(clean_token) == 1:
                                    should_merge = True
                                # Rule 3: Left token is a single letter or special cluster, and right starts with a letter
                                elif (len(clean_prev) == 1 or clean_prev.lower() in SPECIAL_CLUSTERS):
                                    should_merge = True
                                # Rule 4: Either ends/starts with a diacritic letter, and both sides are letters
                                elif (clean_prev[-1] in DIACRITICS or clean_token[0] in DIACRITICS):
                                    should_merge = True
                
        if should_merge:
            result[-1] = prev + token
        else:
            result.append(token)
            
    # Now segment any merged words back into syllables if they combined together
    final_tokens = []
    for token in result:
        if token == '\x00':
            final_tokens.append(token)
        else:
            final_tokens.append(segment_word(token))
            
    joined = ' '.join(final_tokens)
    joined = joined.replace('\x00', ' ')
    joined = re.sub(r'\s+', ' ', joined)
    return joined.strip()

def clean_spaces(text):
    # Strip branding headers, footers and timestamps if they got appended
    text = re.sub(r'EduQuiz\s*-\s*.*$', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\d{1,2}:\d{2}\s+\d{1,2}/\d{1,2}/\d{2,4}.*$', '', text)
    # Strip metadata stamps like "Câu 2 (M ộ t đ áp án)" or "Câu 2"
    text = re.sub(r'C\s*â\s*u\s*\d+\s*\([^)]*\)\s*$', '', text, flags=re.IGNORECASE)
    text = re.sub(r'C\s*â\s*u\s*\d+\s*$', '', text, flags=re.IGNORECASE)
    
    # Reconstruct Vietnamese spaces
    text = merge_vietnamese_spaces(text)
    return text.strip()

def should_ignore_line(line_str):
    line_lower = line_str.lower()
    
    # If the line starts a question (has a colon), do NOT ignore it
    if re.match(r'^C\s*â\s*u\s*\d+\s*:', line_str, re.IGNORECASE):
        return False
        
    # 1. Question metadata like "Câu 1 (Một đáp án)" as a standalone line
    if re.match(r'^C\s*â\s*u\s*\d+\s*\([^)]*\)$', line_str, re.IGNORECASE):
        return True
    # 1.5. Standalone parenthesis metadata e.g. "(Một đáp án)"
    if re.match(r'^\([^)]*\)$', line_str):
        return True
    # 2. EduQuiz branding or header/footer text
    if 'eduquiz' in line_lower:
        return True
    # 3. Page numbers (e.g., "1/5", "Trang 5")
    if re.match(r'^\d+\s*/\s*\d+$', line_str) or 'trang' in line_lower:
        return True
    # 4. URLs
    if line_lower.startswith('http') or 'www.' in line_lower:
        return True
    # 5. Timestamp/Date strings (e.g., "18:30 20/6/26")
    if re.search(r'\d{1,2}:\d{2}', line_str) and re.search(r'\d{1,2}/\d{1,2}/\d{2,4}', line_str):
        return True
    return False

def guess_image_format(data):
    if data.startswith(b'\xff\xd8\xff'):
        return 'jpeg'
    elif data.startswith(b'\x89PNG\r\n\x1a\n'):
        return 'png'
    elif data.startswith(b'GIF87a') or data.startswith(b'GIF89a'):
        return 'gif'
    elif data.startswith(b'RIFF') and len(data) > 12 and data[8:12] == b'WEBP':
        return 'webp'
    return None  # Unknown / raw pixel data


MAX_IMAGE_WIDTH = 900  # Max output image width in pixels


def compress_image_bytes(raw, fmt=None):
    """
    Takes raw image bytes and returns (base64_string, mime_type).
    If the bytes are already a valid image format (JPEG/PNG/GIF/WEBP), compress/resize as needed.
    If the format is unknown (raw pixels), try to load via Pillow.
    Returns None if conversion fails.
    """
    if not HAS_PILLOW:
        # Fallback: just base64 the raw data with best-guess MIME
        fmt = fmt or guess_image_format(raw)
        if fmt is None:
            return None
        b64 = base64.b64encode(raw).decode('utf-8')
        return b64, f'image/{fmt}'

    try:
        img = PILImage.open(io.BytesIO(raw))
        img = img.convert('RGB')  # Normalize to RGB (handles CMYK, L, RGBA etc.)
        # Resize if wider than MAX_IMAGE_WIDTH
        if img.width > MAX_IMAGE_WIDTH:
            ratio = MAX_IMAGE_WIDTH / img.width
            new_h = int(img.height * ratio)
            img = img.resize((MAX_IMAGE_WIDTH, new_h), PILImage.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format='JPEG', quality=82, optimize=True)
        b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        return b64, 'image/jpeg'
    except Exception:
        return None


def raw_xobj_to_b64(obj, raw):
    """
    Convert XObject image data to base64.
    Uses Pillow to decode raw pixels if the bytes aren't a self-contained image format.
    """
    fmt = guess_image_format(raw)

    if fmt is not None:
        # Already a valid image format — compress/resize via Pillow
        result = compress_image_bytes(raw, fmt)
        if result:
            b64, mime = result
            return f'data:{mime};base64,{b64}'
        # Fallback: return raw as-is
        return f'data:image/{fmt};base64,' + base64.b64encode(raw).decode('utf-8')

    # Unknown format — try to reconstruct using XObject metadata
    if not HAS_PILLOW:
        return None
    try:
        width = obj.get('/Width')
        height = obj.get('/Height')
        cs = obj.get('/ColorSpace')
        bpc = obj.get('/BitsPerComponent', 8)
        if not width or not height:
            return None
        width = int(width)
        height = int(height)
        bpc = int(bpc)
        # Determine mode
        if cs == '/DeviceGray' or cs == '/G':
            mode = 'L'
            expected = width * height * (bpc // 8)
        elif cs == '/DeviceCMYK':
            mode = 'CMYK'
            expected = width * height * 4 * (bpc // 8)
        else:  # DeviceRGB or anything else
            mode = 'RGB'
            expected = width * height * 3 * (bpc // 8)
        if len(raw) < expected // 2:  # Sanity check: data too short
            return None
        img = PILImage.frombytes(mode, (width, height), raw)
        img = img.convert('RGB')
        if img.width > MAX_IMAGE_WIDTH:
            ratio = MAX_IMAGE_WIDTH / img.width
            img = img.resize((MAX_IMAGE_WIDTH, int(img.height * ratio)), PILImage.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format='JPEG', quality=82, optimize=True)
        b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        return f'data:image/jpeg;base64,{b64}'
    except Exception as e:
        sys.stderr.write(f'[XObj convert] {e}\n')
        return None

def question_needs_image(q):
    text_to_check = q['content'].lower()
    for ans in q['answers']:
        text_to_check += " " + ans['content'].lower()
    
    # Exclude common false positives containing "hình" or "figure"
    excludes = [
        "cấu hình", "mô hình", "hình thức", "tình hình", "điển hình", "hình học", "tàng hình", "địa hình",
        "configure", "configuration", "configuring", "pre-configure", "reconfigure"
    ]
    for ex in excludes:
        text_to_check = text_to_check.replace(ex, "")
        
    # Keywords indicating a figure/diagram/table/graph is needed
    keywords = ["hình", "đồ thị", "bảng", "sơ đồ", "biểu đồ", "figure", "diagram", "chart", "graph", "table", "illustration", "exhibit"]
    return any(kw in text_to_check for kw in keywords)

def extract_xobjects_to_images(xobj_dict, seen_data, page_images, depth=0):
    """Recursively walk XObject dict, appending unique base64 image strings."""
    if not xobj_dict or depth > 4:
        return
    for key in xobj_dict:
        try:
            obj = xobj_dict[key].get_object()
            subtype = obj.get('/Subtype')
            if subtype == '/Image':
                try:
                    raw = obj.get_data()
                    if raw and len(raw) > 100:
                        h = hash(raw[:256])
                        if h not in seen_data:
                            seen_data.add(h)
                            data_url = raw_xobj_to_b64(obj, raw)
                            if data_url:
                                page_images.append(data_url)
                except Exception:
                    pass
            elif subtype == '/Form':
                try:
                    form_res = obj.get('/Resources')
                    if form_res:
                        nested = form_res.get('/XObject')
                        if nested:
                            extract_xobjects_to_images(nested, seen_data, page_images, depth + 1)
                except Exception:
                    pass
        except Exception:
            pass


def parse_pdf(pdf_path):
    if not os.path.exists(pdf_path):
        return {"success": False, "error": f"File not found: {pdf_path}"}

    try:
        reader = pypdf.PdfReader(pdf_path)
    except Exception as e:
        return {"success": False, "error": f"Failed to read PDF: {str(e)}"}

    questions = []
    current_q = None
    
    # Store page-by-page images to map them
    # page_idx -> list of base64 images
    page_images_map = {}

    for page_idx, page in enumerate(reader.pages):
        seen_data = set()
        page_images = []

        # Strategy 1: page.images (handles inline images + some XObjects)
        for img in page.images:
            try:
                raw = img.data
                if raw and len(raw) > 100:
                    h = hash(raw[:256])
                    if h not in seen_data:
                        seen_data.add(h)
                        # Use Pillow-based compress for page.images too
                        result = compress_image_bytes(raw)
                        if result:
                            b64, mime = result
                            page_images.append(f'data:{mime};base64,{b64}')
                        else:
                            # Fallback: raw base64 with guessed format
                            fmt = guess_image_format(raw)
                            if fmt:
                                page_images.append(
                                    f'data:image/{fmt};base64,'
                                    + base64.b64encode(raw).decode('utf-8')
                                )
            except Exception as e:
                sys.stderr.write(f"[S1] page {page_idx}: {e}\n")

        # Strategy 2 & 3: Walk /Resources/XObject to catch images inside Form XObjects
        try:
            resources = page.get('/Resources')
            if resources:
                xobjects = resources.get('/XObject')
                if xobjects:
                    extract_xobjects_to_images(xobjects, seen_data, page_images)
        except Exception as e:
            sys.stderr.write(f"[S2/S3] page {page_idx}: {e}\n")

        if page_images:
            page_images_map[page_idx] = page_images

        text = page.extract_text()
        lines = text.split('\n')

        for line in lines:
            line_str = line.strip()
            if not line_str or should_ignore_line(line_str):
                continue

            # Match: Câu 1: (or Câu 1 (Một đáp án))
            q_match = re.match(r'^C\s*â\s*u\s*(\d+)\s*:\s*(.+)$', line_str, re.IGNORECASE)
            if q_match:
                q_num = int(q_match.group(1))
                q_text = q_match.group(2)
                
                if current_q:
                    # Clean last answer text before pushing
                    questions.append(current_q)
                    
                current_q = {
                    'num': q_num,
                    'content': clean_spaces(q_text),
                    'answers': [],
                    'explanation': 'Đáp án đúng dựa vào tài liệu ôn tập.',
                    'page_idx': page_idx
                }
                continue

            # Match choice line prefix (A. or *A., case insensitive)
            is_opt_line = re.match(r'^([\*✓✔]?)\s*([A-D])\s*\.', line_str, re.IGNORECASE)
            if is_opt_line and current_q:
                # Extract all options present on this line using findall (handles inline/grid layout)
                opts = re.findall(r'(?:^|\s+)([\*✓✔]?)\s*([A-D])\s*\.\s*(.*?)(?=\s+[\*✓✔]?[A-D]\s*\.|$)', line_str, re.IGNORECASE)
                for opt_marker, opt_letter, opt_content in opts:
                    letter = opt_letter.upper()
                    content = clean_spaces(opt_content)
                    
                    # Detect correct answer via start marker (*A., ✓A.)
                    is_correct = bool(opt_marker)
                    
                    # Also detect trailing correct marker (e.g. A. option text* or A. option text (đúng))
                    content_lower = content.lower()
                    if content_lower.endswith('*') or content_lower.endswith('(đúng)') or content_lower.endswith('(correct)'):
                        is_correct = True
                        content = re.sub(r'\s*\*$', '', content)
                        content = re.sub(r'\s*\((?:đúng|correct)\)$', '', content, flags=re.IGNORECASE)
                    
                    current_q['answers'].append({
                        'letter': letter,
                        'content': content,
                        'isCorrect': is_correct
                    })
                continue

            # Continuation of question or choices
            if current_q:
                if not current_q['answers']:
                    # Append to question text
                    current_q['content'] += ' ' + clean_spaces(line_str)
                else:
                    # Append to last choice text
                    current_q['answers'][-1]['content'] += ' ' + clean_spaces(line_str)

    if current_q:
        questions.append(current_q)

    # Now associate images from page_images_map to the correct questions
    # 1. Identify recurring template/logo/header/footer images across pages
    image_pages = {} # base64_str -> set of page indices
    for page_idx, images in page_images_map.items():
        for img in images:
            if img not in image_pages:
                image_pages[img] = set()
            image_pages[img].add(page_idx)
            
    total_pages = len(reader.pages)
    logo_images = set()
    for img, pages in image_pages.items():
        # Only filter out recurring logo/template images if the document has at least 3 pages
        if total_pages >= 3 and len(pages) > 2:
            logo_images.add(img)

    # 3. Associate unique (non-logo) images with questions using a sequential proximity algorithm
    unassigned_images_by_page = {}
    for page_idx, images in page_images_map.items():
        content_images = [img for img in images if img not in logo_images]
        if content_images:
            unassigned_images_by_page[page_idx] = list(content_images)

    # Pass 1: Match questions that need an image to the closest unassigned images in sequential order
    for q in questions:
        if question_needs_image(q):
            # Look for an image in pages near the question
            for offset in [0, 1, -1, 2, -2]:
                target_page = q['page_idx'] + offset
                if target_page in unassigned_images_by_page and unassigned_images_by_page[target_page]:
                    q['imageUrl'] = unassigned_images_by_page[target_page].pop(0)
                    break

    # Pass 2: Fallback - match any remaining unassigned images to questions without images nearby
    for q in questions:
        if 'imageUrl' not in q:
            for offset in [0, 1, -1, 2, -2]:
                target_page = q['page_idx'] + offset
                if target_page in unassigned_images_by_page and unassigned_images_by_page[target_page]:
                    q['imageUrl'] = unassigned_images_by_page[target_page].pop(0)
                    break



    # Convert to schema format
    final_questions = []
    for q in questions:
        # Verify question has at least some answers to be valid
        if len(q["answers"]) > 0:
            # Ensure at least one answer is marked correct
            has_correct = any(ans["isCorrect"] for ans in q["answers"])
            if not has_correct:
                q["answers"][0]["isCorrect"] = True

            final_questions.append({
                "content": q["content"],
                "explanation": q["explanation"],
                "points": 2,
                "imageUrl": q.get("imageUrl"),
                "answers": [
                    {"content": ans["content"], "isCorrect": ans["isCorrect"]}
                    for ans in q["answers"]
                ]
            })

    title = os.path.basename(pdf_path).replace('.pdf', '').replace('_', ' ')
    return {
        "success": True,
        "exam": {
            "title": title,
            "description": f"Đề thi tự động bóc tách từ tệp {os.path.basename(pdf_path)}.",
            "duration": max(15, len(final_questions) * 2),
            "questions": final_questions
        }
    }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No PDF path provided."}))
        sys.exit(1)
        
    pdf_path = sys.argv[1]
    res = parse_pdf(pdf_path)
    print(json.dumps(res, ensure_ascii=False))
