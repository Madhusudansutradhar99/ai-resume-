import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.ai_client import call_pollinations

def test_pollinations():
    try:
        print("Testing Pollinations AI...")
        response = call_pollinations("Return a JSON with name: John and age: 30", system="You are a helpful assistant.")
        print("Response:", response)
        print("Test passed.")
    except Exception as e:
        print("Test failed:", e)

if __name__ == "__main__":
    test_pollinations()
