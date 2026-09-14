import sys
import os

# Add backend directory to sys.path so app module can be loaded by Vercel serverless
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
backend_dir = os.path.join(root_dir, "backend")

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from app.main import app
from app.database import init_db

# Initialize database tables on serverless function module load
try:
    init_db()
except Exception as e:
    print(f"[Vercel Database Init Warning] {e}")
