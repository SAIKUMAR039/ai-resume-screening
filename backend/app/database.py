import os
import tempfile
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Obtain database configuration from environment
DATABASE_URL = os.getenv("DATABASE_URL")
SUPABASE_URL = os.getenv("SUPABASE_URL")

# Build connection URL
if not DATABASE_URL and SUPABASE_URL:
    DATABASE_URL = os.getenv("SUPABASE_DB_URL", "postgresql://postgres:postgres@localhost:5432/resume_db")

if not DATABASE_URL:
    # Check if running on Vercel / serverless environment (read-only filesystem except /tmp)
    if os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
        sqlite_path = os.path.join(tempfile.gettempdir(), "resume_screening.db")
    else:
        sqlite_path = "./resume_screening.db"
    DATABASE_URL = f"sqlite:///{sqlite_path}"

# Handle PostgreSQL url prefix compatibility (postgres:// -> postgresql://)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

is_sqlite = DATABASE_URL.startswith("sqlite")

engine_args = {}
if is_sqlite:
    engine_args["connect_args"] = {"check_same_thread": False}

try:
    engine = create_engine(DATABASE_URL, **engine_args)
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
except Exception as e:
    print(f"[Database Warning] PostgreSQL connection failed: {e}. Falling back to SQLite.")
    sqlite_path = os.path.join(tempfile.gettempdir(), "resume_screening.db")
    DATABASE_URL = f"sqlite:///{sqlite_path}"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency for obtaining DB session in API routes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Create all database tables."""
    Base.metadata.create_all(bind=engine)
