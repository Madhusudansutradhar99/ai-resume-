import urllib.request
import json
import traceback

def test_ddg_chat():
    url_status = "https://duckduckgo.com/duckchat/v1/status"
    req_status = urllib.request.Request(
        url_status,
        headers={"x-vqd-accept": "1", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    )
    
    try:
        with urllib.request.urlopen(req_status) as response:
            vqd = response.headers.get("x-vqd-4")
            print("Successfully retrieved vqd:", vqd)
            
            if not vqd:
                print("No vqd token returned in headers. Response headers:")
                print(dict(response.headers))
                return
                
            # Send chat message
            url_chat = "https://duckduckgo.com/duckchat/v1/chat"
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "user", "content": "Hello! Introduce yourself briefly."}
                ]
            }
            
            req_chat = urllib.request.Request(
                url_chat,
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "x-vqd-4": vqd,
                    "Content-Type": "application/json",
                    "Accept": "text/event-stream",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                },
                method="POST"
            )
            
            with urllib.request.urlopen(req_chat) as chat_response:
                print("Chat response status:", chat_response.status)
                body = chat_response.read().decode("utf-8")
                print("Response data sample:")
                print(body[:800])
                
    except Exception as e:
        print("Error during request:")
        traceback.print_exc()

if __name__ == "__main__":
    test_ddg_chat()
