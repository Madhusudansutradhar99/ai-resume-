import sys
from pathlib import Path


# Add project root and api directory to sys.path so Vercel can resolve absolute imports
root_dir = Path(__file__).resolve().parent.parent
api_dir = Path(__file__).resolve().parent

if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))
if str(api_dir) not in sys.path:
    sys.path.insert(0, str(api_dir))

import traceback

try:
    print("Attempting import from api.main...")
    from api.main import app
except Exception as e:
    print("Failed to import from api.main:")
    traceback.print_exc()
    try:
        print("Attempting import from .main...")
        from .main import app
    except Exception as e2:
        print("Failed to import from .main:")
        traceback.print_exc()
        try:
            print("Attempting import from main...")
            from main import app  # noqa: E402
        except Exception as e3:
            print("Failed to import from main:")
            traceback.print_exc()
            raise e3