import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.app.config import settings

logger = logging.getLogger(__name__)

def _make_engine():
    url = settings.database_url

    # SQLite (local dev)
    if "sqlite" in url:
        engine = create_engine(url, connect_args={"check_same_thread": False})
        logger.info("✓ Connected to SQLite (dev mode)")
        return engine

    # PostgreSQL (Neon / Render / Supabase / production)
    if "postgresql" in url or "postgres://" in url:
        # Render sometimes gives postgres:// — SQLAlchemy needs postgresql://
        url = url.replace("postgres://", "postgresql://", 1)
        # Ensure SSL for cloud providers
        if "sslmode" not in url:
            url = url + ("&" if "?" in url else "?") + "sslmode=require"
        engine = create_engine(
            url,
            pool_size=5,
            max_overflow=10,
            pool_pre_ping=True,   # drop dead connections automatically
            pool_recycle=300,     # recycle after 5 min (Neon idles connections)
        )
        logger.info(f"✓ Connected to PostgreSQL (Neon): ...{url.split('@')[-1].split('?')[0]}")
        return engine

    # Fallback
    engine = create_engine(url)
    logger.info(f"✓ Connected to database: {url.split('@')[-1] if '@' in url else url}")
    return engine

try:
    engine = _make_engine()
except Exception as e:
    logger.error(f"❌ Database connection failed: {e}")
    logger.warning("Falling back to SQLite")
    engine = create_engine("sqlite:///./medvision.db", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_connection() -> bool:
    """Called at startup to verify DB is reachable."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error(f"❌ DB connection test failed: {e}")
        return False
