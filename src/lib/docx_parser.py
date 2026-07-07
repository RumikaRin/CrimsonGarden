import json
import re
import sys
import os
import base64

try:
    import docx
except ImportError:
    print(json.dumps({"success": False, "error": "Vui lòng cài đặt thư viện python-docx bằng lệnh: pip install python-docx"}))
    sys.exit(1)

def extract_image_base64(run):
    """
    Extracts image data from a python-docx Run object if it contains an image.
    Returns base64 string or None.
    """
    try:
        embed_id = None
        # Try DrawingML (a:blip)
        blips = run._r.xpath('.//*[local-name()="blip"]')
        if blips:
            embed_id = blips[0].get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed')
            
        # Try VML (v:imagedata)
        if not embed_id:
            imagedata = run._r.xpath('.//*[local-name()="imagedata"]')
            if imagedata:
                embed_id = imagedata[0].get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
                
        if embed_id:
            part = run.part.related_parts[embed_id]
            image_blob = part.blob
            # Determine MIME type heuristically
            header = image_blob[:12]
            mime = "image/jpeg"
            if header.startswith(b'\x89PNG\r\n\x1a\n'):
                mime = "image/png"
            elif header.startswith(b'GIF87a') or header.startswith(b'GIF89a'):
                mime = "image/gif"
            
            b64 = base64.b64encode(image_blob).decode('utf-8')
            return f"data:{mime};base64,{b64}"
    except Exception as e:
        pass
    return None

def parse_docx(docx_path):
    doc = docx.Document(docx_path)
    
    questions = []
    current_q = None
    
    for para in doc.paragraphs:
        text = para.text.strip()
        
        # Check for images in this paragraph
        images_in_para = []
        for run in para.runs:
            img_b64 = extract_image_base64(run)
            if img_b64:
                images_in_para.append(img_b64)
                
        # If it's a new question
        match_q = re.match(r'^Câu\s*(\d+)', text, re.IGNORECASE)
        if match_q:
            if current_q:
                questions.append(current_q)
            current_q = {
                'text': text,
                'options': [],
                'imageUrl': None
            }
            # If the paragraph containing the question also has an image
            if images_in_para:
                current_q['imageUrl'] = images_in_para[0]
        else:
            if current_q:
                # Check for options (A., B., C., D.)
                match_opt = re.match(r'^([A-D])\s*[\.\:\)]\s*(.*)', text, re.IGNORECASE)
                if match_opt:
                    opt_letter = match_opt.group(1).upper()
                    opt_content = match_opt.group(2).strip()
                    # Check if it's correct (e.g. bold or red or underlined)
                    # For simplicity in docx, we just mark it false and let the user set it, 
                    # OR we can check run styles!
                    is_correct = False
                    for run in para.runs:
                        if run.bold or run.underline or (run.font.color and run.font.color.rgb and run.font.color.rgb != docx.shared.RGBColor(0, 0, 0)):
                            is_correct = True
                    
                    current_q['options'].append({
                        'letter': opt_letter,
                        'content': opt_content,
                        'isCorrect': is_correct
                    })
                elif text:
                    # Append to question text
                    current_q['text'] += "\n" + text
                    
                # If we found an image on an intermediate line, attach it to current question
                if images_in_para and not current_q['imageUrl']:
                    current_q['imageUrl'] = images_in_para[0]
                    
    if current_q:
        questions.append(current_q)
        
    # Format to match web app requirements
    final_questions = []
    for q in questions:
        # Determine correct answer if none marked
        answers = q['options']
        if answers and not any(a['isCorrect'] for a in answers):
            # Fallback: mark first as correct if none found (so it doesn't break schema)
            answers[0]['isCorrect'] = True
            
        final_questions.append({
            "content": q['text'],
            "explanation": "Đáp án đúng dựa vào tài liệu ôn tập.",
            "points": 2,
            "imageUrl": q['imageUrl'],
            "answers": [
                {"content": a['content'], "isCorrect": a['isCorrect']}
                for a in answers
            ]
        })
        
    title = os.path.basename(docx_path).replace('.docx', '').replace('_', ' ')
    return {
        "success": True,
        "exam": {
            "title": title,
            "description": f"Đề thi tự động bóc tách từ tệp {os.path.basename(docx_path)}.",
            "duration": max(15, len(final_questions) * 2),
            "questions": final_questions
        }
    }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No DOCX path provided."}))
        sys.exit(1)
        
    docx_path = sys.argv[1]
    res = parse_docx(docx_path)
    print(json.dumps(res, ensure_ascii=False))
