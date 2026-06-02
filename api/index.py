import sys
from pathlib import Path


# Add project root and api directory to sys.path so Vercel can resolve absolute imports
root_dir = Path(__file__).resolve().parent.parent
api_dir = Path(__file__).resolve().parent

if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))
if str(api_dir) not in sys.path:
    sys.path.insert(0, str(api_dir))

try:
    from api.main import app
except ImportError:
    try:
        from .main import app
    except ImportError:
        from main import app  # noqa: E402