import os
import google.generativeai as genai
from anthropic import Anthropic

def get_gemini_key():
    key = os.getenv("GEMINI_API_KEY")
    if key and "please-add" not in key and len(key.strip()) > 10:
        return key.strip()
    return None

def get_anthropic_key():
    key = os.getenv("ANTHROPIC_API_KEY")
    if key and "please-add" not in key and len(key.strip()) > 10:
        return key.strip()
    return None

def call_ai(prompt: str, max_tokens: int = 2000, system: str = None, enable_search: bool = False) -> str:
    """Universal wrapper to call AI using Gemini (prefered) or Claude (fallback)"""
    gemini_key = get_gemini_key()
    if gemini_key:
        try:
            genai.configure(api_key=gemini_key)
            model_name = "gemini-2.5-flash"
            
            kwargs = {}
            if enable_search:
                kwargs["tools"] = ["google_search"]
                
            generation_config = {}
            if "json" in prompt.lower() or "json" in (system or "").lower():
                generation_config["response_mime_type"] = "application/json"
            
            try:
                if system:
                    model = genai.GenerativeModel(model_name, system_instruction=system, **kwargs)
                else:
                    model = genai.GenerativeModel(model_name, **kwargs)
                
                response = model.generate_content(
                    prompt,
                    generation_config=generation_config
                )
                return response.text
            except Exception as e:
                # If Google Search tool failed (e.g. not supported in this model/region), retry without search
                if enable_search:
                    print(f"Gemini with search failed, retrying without search. Error: {str(e)}")
                    kwargs.pop("tools", None)
                    if system:
                        model = genai.GenerativeModel(model_name, system_instruction=system, **kwargs)
                    else:
                        model = genai.GenerativeModel(model_name, **kwargs)
                    response = model.generate_content(
                        prompt,
                        generation_config=generation_config
                    )
                    return response.text
                else:
                    raise e
        except Exception as e:
            print(f"Gemini API call failed, trying Claude... Error: {str(e)}")
    
    anthropic_key = get_anthropic_key()
    if anthropic_key:
        try:
            claude_client = Anthropic(api_key=anthropic_key)
            
            kwargs = {
                "model": "claude-sonnet-4-20250514",
                "max_tokens": max_tokens,
                "messages": [{"role": "user", "content": prompt}]
            }
            if system:
                kwargs["system"] = system
                
            message = claude_client.messages.create(**kwargs)
            return message.content[0].text
        except Exception as e:
            print(f"Claude API call failed: {str(e)}")
            raise e
            
    raise ValueError("No valid AI API key (Gemini or Claude) found in environment variables.")
