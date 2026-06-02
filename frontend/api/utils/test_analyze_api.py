import urllib.request
import urllib.parse
import mimetypes
import uuid
import json

def send_multipart_formdata(url, fields, files):
    boundary = uuid.uuid4().hex
    CRLF = '\r\n'
    L = []
    
    for key, value in fields.items():
        L.append(f'--{boundary}')
        L.append(f'Content-Disposition: form-data; name="{key}"')
        L.append('')
        L.append(value)
        
    for key, (filename, content) in files.items():
        L.append(f'--{boundary}')
        L.append(f'Content-Disposition: form-data; name="{key}"; filename="{filename}"')
        mimetype = mimetypes.guess_type(filename)[0] or 'application/octet-stream'
        L.append(f'Content-Type: {mimetype}')
        L.append('')
        L.append(content)
        
    L.append(f'--{boundary}--')
    L.append('')
    
    # Construct body bytes
    body = bytearray()
    for item in L:
        if isinstance(item, str):
            body.extend((item + CRLF).encode('utf-8'))
        else:
            body.extend(item)
            body.extend(CRLF.encode('utf-8'))
            
    req = urllib.request.Request(
        url,
        data=body,
        headers={
            'Content-Type': f'multipart/form-data; boundary={boundary}',
            'User-Agent': 'Mozilla/5.0'
        }
    )
    return urllib.request.urlopen(req)

def test_analyze_endpoint():
    import os
    current_dir = os.path.dirname(os.path.abspath(__file__))
    docx_path = os.path.join(current_dir, '..', 'test_resume.docx')
    with open(docx_path, 'rb') as f:
        file_content = f.read()
        
    url = "http://localhost:8000/api/analyze"
    fields = {
        "jobDescription": "Looking for a React Frontend Developer with TypeScript, Next.js, and CSS layout skills."
    }
    files = {
        "resume": ("test_resume.docx", file_content)
    }
    
    print("Sending request to /api/analyze...")
    try:
        with send_multipart_formdata(url, fields, files) as response:
            print("Response Status:", response.status)
            res_body = response.read().decode('utf-8')
            res_json = json.loads(res_body)
            
            print("\nAnalysis Overall Score:", res_json.get("overallScore"))
            print("Detected Field:", res_json.get("careerGuidance", {}).get("targetField"))
            print("Is Fallback?", res_json.get("isFallback"))
            print("Strengths:", res_json.get("strengths")[:2])
            print("Weaknesses:", res_json.get("weaknesses")[:2])
            print("Parsed Text Length:", len(res_json.get("parsedText", "")))
            
            print("\nAPI Test PASSED successfully!")
    except Exception as e:
        print("\nAPI Test FAILED:")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_analyze_endpoint()
