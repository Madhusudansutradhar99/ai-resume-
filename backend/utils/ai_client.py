import os
import google.generativeai as genai
from anthropic import Anthropic
import subprocess
import urllib.request
import json

def _is_valid_api_key(key: str | None, min_len: int = 10) -> bool:
    if not key:
        return False
    k = key.strip()
    if len(k) < min_len:
        return False
    if "please-add" in k.lower() or k.lower().startswith("your_"):
        return False
    return True


def get_gemini_key(client_key: str | None = None) -> str | None:
    """Gemini key from client header (AIza*) or GEMINI_API_KEY env — never embedded in source."""
    if client_key and client_key.strip().startswith("AIza") and _is_valid_api_key(client_key):
        return client_key.strip()
    env_key = os.getenv("GEMINI_API_KEY")
    if _is_valid_api_key(env_key):
        return env_key.strip()
    return None


def get_anthropic_key():
    key = os.getenv("ANTHROPIC_API_KEY")
    if _is_valid_api_key(key):
        return key.strip()
    return None

def get_github_token(client_token: str = None) -> str:
    """Retrieve the user's saved GitHub credential token via client header, env, or git credential fill"""
    if client_token:
        return client_token.strip()
        
    # Check env first
    token = os.getenv("GITHUB_TOKEN") or os.getenv("GH_TOKEN")
    if token:
        return token.strip()
        
    # Skip git credential check in server/serverless production environments to prevent blocking hangs
    if os.getenv("VERCEL") or os.getenv("RENDER") or os.getenv("PORT") or os.getenv("K_SERVICE"):
        return None
        
    # Attempt to read from Git Credential Manager
    try:
        proc = subprocess.Popen(
            ["git", "credential", "fill"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        try:
            stdout, _ = proc.communicate(input="protocol=https\nhost=github.com\n", timeout=2)
            for line in stdout.splitlines():
                if line.startswith("password="):
                    tok = line.split("=", 1)[1].strip()
                    if tok.startswith("gho_") or tok.startswith("ghp_") or tok.startswith("github_pat_"):
                        return tok
        except subprocess.TimeoutExpired:
            proc.kill()
            print("Git credential helper timed out.")
    except Exception as e:
        print(f"Failed to retrieve GitHub credential: {str(e)}")
        
    return None

def call_github_models(prompt: str, max_tokens: int = 2000, system: str = None, client_token: str = None) -> str:
    """Make a call to the free GitHub Models API using gpt-4o-mini"""
    token = get_github_token(client_token)
    if not token:
        raise ValueError("No GitHub token found to authenticate with GitHub Models.")
        
    url = "https://models.inference.ai.azure.com/chat/completions"
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})
    
    data = {
        "messages": messages,
        "model": "gpt-4o-mini",
        "max_tokens": max_tokens
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        },
        method="POST"
    )
    
    with urllib.request.urlopen(req, timeout=20) as response:
        res = json.loads(response.read().decode("utf-8"))
        return res["choices"][0]["message"]["content"]

def call_ddg_chat(prompt: str, max_tokens: int = 2000, system: str = None) -> str:
    """Free keyless fallback using DuckDuckGo AI Chat (gpt-4o-mini)"""
    import urllib.request
    import json
    
    url_status = "https://duckduckgo.com/duckchat/v1/status"
    req_status = urllib.request.Request(
        url_status,
        headers={"x-vqd-accept": "1", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    )
    
    # 1. Get VQD token
    with urllib.request.urlopen(req_status, timeout=10) as response:
        vqd = response.headers.get("x-vqd-4")
        if not vqd:
            raise ValueError("Failed to retrieve DuckDuckGo Chat VQD token.")
            
    # 2. Send chat request
    url_chat = "https://duckduckgo.com/duckchat/v1/chat"
    
    messages = []
    if system:
        messages.append({"role": "user", "content": f"System Instruction: {system}"})
    messages.append({"role": "user", "content": prompt})
    
    payload = {
        "model": "gpt-4o-mini",
        "messages": messages
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
    
    with urllib.request.urlopen(req_chat, timeout=20) as chat_response:
        body = chat_response.read().decode("utf-8")
        
    text_parts = []
    for line in body.split("\n"):
        if line.startswith("data:"):
            data_str = line[5:].strip()
            if data_str == "[DONE]":
                break
            try:
                data_json = json.loads(data_str)
                message = data_json.get("message")
                if message:
                    text_parts.append(message)
            except Exception:
                pass
                
    result_text = "".join(text_parts).strip()
    if not result_text:
        raise ValueError("DuckDuckGo Chat returned an empty response.")
        
    return result_text

def call_ai(prompt: str, max_tokens: int = 2000, system: str = None, enable_search: bool = False, api_key: str = None, github_token: str = None) -> str:
    """Universal wrapper: Gemini (preferred), Claude, GitHub Models, then DuckDuckGo. Requires env or client Gemini key."""
    gemini_key = get_gemini_key(api_key)
    if gemini_key:
        try:
            genai.configure(api_key=gemini_key)
            # Try a fallback chain of models to prevent 404 model not found errors due to deprecations
            models_to_try = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-flash-latest"]
            
            kwargs = {}
            if enable_search:
                kwargs["tools"] = ["google_search"]
                
            generation_config = {}
            if "json" in prompt.lower() or "json" in (system or "").lower():
                generation_config["response_mime_type"] = "application/json"
            
            response = None
            last_err = None
            for m_name in models_to_try:
                try:
                    if system:
                        model = genai.GenerativeModel(m_name, system_instruction=system, **kwargs)
                    else:
                        model = genai.GenerativeModel(m_name, **kwargs)
                    
                    response = model.generate_content(
                        prompt,
                        generation_config=generation_config
                    )
                    return response.text
                except Exception as e:
                    # If Google Search tool failed, retry without search
                    if enable_search:
                        try:
                            print(f"Gemini with search failed on {m_name}, retrying without search. Error: {str(e)}")
                            kwargs_no_search = kwargs.copy()
                            kwargs_no_search.pop("tools", None)
                            if system:
                                model = genai.GenerativeModel(m_name, system_instruction=system, **kwargs_no_search)
                            else:
                                model = genai.GenerativeModel(m_name, **kwargs_no_search)
                            response = model.generate_content(
                                prompt,
                                generation_config=generation_config
                            )
                            return response.text
                        except Exception as e_inner:
                            last_err = e_inner
                    else:
                        last_err = e
            
            if last_err:
                raise last_err
        except Exception as e:
            print(f"Gemini API call failed, trying Claude/GitHub... Error: {str(e)}")
    
    # Fallback to Claude (Anthropic key only — do not confuse with GitHub token)
    anthropic_key = get_anthropic_key()
    if anthropic_key:
        try:
            claude_client = Anthropic(api_key=anthropic_key)
            
            kwargs = {
                "model": "claude-3-5-sonnet-latest",
                "max_tokens": max_tokens,
                "messages": [{"role": "user", "content": prompt}]
            }
            if system:
                kwargs["system"] = system
                
            message = claude_client.messages.create(**kwargs)
            return message.content[0].text
        except Exception as e:
            print(f"Claude API call failed: {str(e)}")
            
    # Fallback to GitHub Models (if token available)
    github_tok = github_token or get_github_token()
    if github_tok:
        try:
            print("Falling back to GitHub Models API (gpt-4o-mini)...")
            return call_github_models(prompt, max_tokens, system, github_tok)
        except Exception as e:
            print(f"GitHub Models API fallback failed: {str(e)}")
            
    # Fallback to DuckDuckGo AI Chat (keyless free tier)
    try:
        print("Falling back to DuckDuckGo AI Chat (gpt-4o-mini)...")
        return call_ddg_chat(prompt, max_tokens, system)
    except Exception as e:
        print(f"DuckDuckGo AI Chat fallback failed: {str(e)}")
        
    raise ValueError("No valid AI API key (Gemini, Claude, GitHub, or DuckDuckGo) succeeded.")
