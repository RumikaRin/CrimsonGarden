import sys
import os
import pypdf
import re
import json
import base64

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

def parse_pdf(pdf_path):
    if not os.path.exists(pdf_path):
        return {"success": False, "error": f"File not found: {pdf_path}"}

    try:
        reader = pypdf.PdfReader(pdf_path)
    except Exception as e:
        return {"success": False, "error": f"Failed to read PDF: {str(e)}"}

    # 1. Parse the first page to find which question numbers have images
    image_q_nums = set()
    first_page_text = reader.pages[0].extract_text()
    
    for line in first_page_text.split('\n'):
        if 'câu' in line.lower():
            nums = re.findall(r'\d+', line)
            for n in nums:
                image_q_nums.add(int(n))

    questions = []
    current_q = None
    
    # Store page-by-page images to map them
    # page_idx -> list of base64 images
    page_images_map = {}

    for page_idx, page in enumerate(reader.pages):
        page_images = []
        for img in page.images:
            try:
                img_data = base64.b64encode(img.data).decode('utf-8')
                img_format = img.image.format.lower() if img.image else 'png'
                page_images.append(f"data:image/{img_format};base64,{img_data}")
            except Exception:
                pass
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

            # Match choice: A. or *A.
            opt_match = re.match(r'^(\*?)\s*([A-D])\s*\.\s*(.+)$', line_str)
            if opt_match and current_q:
                is_correct = opt_match.group(1) == '*'
                letter = opt_match.group(2)
                opt_text = opt_match.group(3)
                current_q['answers'].append({
                    'letter': letter,
                    'content': clean_spaces(opt_text),
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
    for q in questions:
        q_num = q['num']
        q_page = q['page_idx']
        
        assigned_img = None
        for p_offset in [0, -1, 1]:
            target_page = q_page + p_offset
            if target_page in page_images_map:
                assigned_img = page_images_map[target_page][0]
                break
                
        if (q_num in image_q_nums) and assigned_img:
            q['imageUrl'] = assigned_img

    # Convert to schema format
    final_questions = []
    for q in questions:
        # Verify question has at least some answers to be valid
        if len(q["answers"]) > 0:
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
