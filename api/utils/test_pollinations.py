import sys
import os

# Add backend directory to sys.path so we can import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.ai_client import call_pollinations

def test_pollinations_analysis():
    print("Testing call_pollinations with a test prompt...")
    
    prompt = """
    Say hello in JSON format.
    Return ONLY a valid JSON object. No markdown fences.
    {
      "message": "hello",
      "test": true
    }
    """
    
    try:
        response = call_pollinations(prompt, max_tokens=100)
        print("Raw Response:")
        print(response)
        
        # Verify JSON
        import json
        data = json.loads(response)
        print("\nParsed JSON successfully:")
        print(data)
        
        print("\nTest passed successfully!")
    except Exception as e:
        print("\nTest failed with error:")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_pollinations_analysis()
