import sys
import os

# Add backend directory to Python sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app
from app.database import init_db

try:
    init_db()
except Exception as e:
    print(f"[Vercel DB Init Warning] {e}")

# Export app & handler for Vercel Python Serverless runtime
handler = app
