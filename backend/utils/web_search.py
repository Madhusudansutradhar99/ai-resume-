import urllib.request
import urllib.parse
import re

# Simple in-memory cache to prevent repeated searches for the same query
_SEARCH_CACHE = {}

def search_ddg(query: str) -> str:
    """
    Perform a free web search using DuckDuckGo HTML search.
    Returns parsed titles and snippets as a single string.
    """
    if not query or len(query.strip()) < 3:
        return "No query provided for search grounding."
        
    cleaned_query = query.strip().lower()
    if cleaned_query in _SEARCH_CACHE:
        return _SEARCH_CACHE[cleaned_query]
        
    try:
        url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
        req = urllib.request.Request(
            url, 
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
            }
        )
        with urllib.request.urlopen(req, timeout=8) as response:
            html = response.read().decode('utf-8')
            
            # Extract snippets and titles
            snippets = re.findall(r'<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>(.*?)</a>', html, re.DOTALL)
            titles = re.findall(r'<a[^>]*class="[^"]*result__a[^"]*"[^>]*>(.*?)</a>', html, re.DOTALL)
            
            results = []
            for t, s in zip(titles[:6], snippets[:6]):
                t_clean = re.sub(r'<[^>]+>', '', t).strip()
                s_clean = re.sub(r'<[^>]+>', '', s).strip()
                results.append(f"Title: {t_clean}\nSnippet: {s_clean}\n---")
                
            out = "\n".join(results)
            if out.strip():
                _SEARCH_CACHE[cleaned_query] = out
                return out
            else:
                return "No search results returned from DDG."
    except Exception as e:
        print(f"Error scraping DuckDuckGo: {str(e)}")
        return f"Error executing live web search grounding: {str(e)}"
