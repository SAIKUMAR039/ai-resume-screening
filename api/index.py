import sys
import os

# Set up python path for backend import
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
backend_dir = os.path.join(root_dir, "backend")

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

try:
    from app.main import app
    from app.database import init_db

    try:
        init_db()
    except Exception as db_err:
        print(f"[Vercel DB Warning] {db_err}")

    # Expose both app and handler for Vercel Python Serverless runtime compatibility
    handler = app

except Exception as err:
    print(f"[Vercel Initialization Error] {err}")
    from fastapi import FastAPI
    app = FastAPI(title="Error Fallback Handler")
    handler = app

    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    def error_fallback(path: str):
        return {
            "error": "Backend Function Invocation Error",
            "detail": str(err),
            "message": "A dependency failed to load during serverless cold-start."
        }
