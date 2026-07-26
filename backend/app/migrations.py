"""
Automatic database migrations for Render free tier.
Runs on startup to keep schema up-to-date without shell access.
"""
import logging
from sqlalchemy import text, inspect
from backend.app.database import engine

logger = logging.getLogger(__name__)


def run_migrations():
    """
    Auto-migrate database schema on startup.
    Safe to run multiple times - checks before applying changes.
    """
    logger.info("🔄 Running database migrations...")
    
    try:
        with engine.connect() as conn:
            inspector = inspect(engine)
            
            # ── Migration 1: Add firebase_uid to users table ────────────────
            if "users" in inspector.get_table_names():
                columns = [col["name"] for col in inspector.get_columns("users")]
                
                if "firebase_uid" not in columns:
                    logger.info("  → Adding firebase_uid column to users table")
                    if "postgresql" in engine.url.drivername or "postgres" in engine.url.drivername:
                        conn.execute(text(
                            "ALTER TABLE users ADD COLUMN firebase_uid VARCHAR UNIQUE"
                        ))
                        conn.execute(text(
                            "CREATE INDEX IF NOT EXISTS ix_users_firebase_uid ON users(firebase_uid)"
                        ))
                    else:  # SQLite
                        conn.execute(text(
                            "ALTER TABLE users ADD COLUMN firebase_uid VARCHAR"
                        ))
                        conn.execute(text(
                            "CREATE UNIQUE INDEX IF NOT EXISTS ix_users_firebase_uid ON users(firebase_uid)"
                        ))
                    conn.commit()
                    logger.info("  ✓ firebase_uid column added")
                else:
                    logger.info("  ✓ firebase_uid column already exists")
            
            # ── Migration 2: Add risk_level to prediction_logs ──────────────
            if "prediction_logs" in inspector.get_table_names():
                columns = [col["name"] for col in inspector.get_columns("prediction_logs")]
                
                if "risk_level" not in columns:
                    logger.info("  → Adding risk_level column to prediction_logs")
                    conn.execute(text(
                        "ALTER TABLE prediction_logs ADD COLUMN risk_level VARCHAR DEFAULT 'Low'"
                    ))
                    conn.commit()
                    logger.info("  ✓ risk_level column added")
                
                if "explanation_text" not in columns:
                    logger.info("  → Adding explanation_text column to prediction_logs")
                    conn.execute(text(
                        "ALTER TABLE prediction_logs ADD COLUMN explanation_text TEXT"
                    ))
                    conn.commit()
                    logger.info("  ✓ explanation_text column added")
            
            # ── Migration 3: Ensure indexes exist ────────────────────────────
            logger.info("  → Ensuring indexes exist")
            
            if "postgresql" in engine.url.drivername or "postgres" in engine.url.drivername:
                # PostgreSQL indexes
                conn.execute(text(
                    "CREATE INDEX IF NOT EXISTS ix_users_email ON users(email)"
                ))
                conn.execute(text(
                    "CREATE INDEX IF NOT EXISTS ix_patients_patient_identifier ON patients(patient_identifier)"
                ))
                conn.execute(text(
                    "CREATE INDEX IF NOT EXISTS ix_prediction_logs_created_at ON prediction_logs(created_at)"
                ))
            else:
                # SQLite indexes
                conn.execute(text(
                    "CREATE INDEX IF NOT EXISTS ix_users_email ON users(email)"
                ))
                conn.execute(text(
                    "CREATE INDEX IF NOT EXISTS ix_patients_patient_identifier ON patients(patient_identifier)"
                ))
                conn.execute(text(
                    "CREATE INDEX IF NOT EXISTS ix_prediction_logs_created_at ON prediction_logs(created_at)"
                ))
            
            conn.commit()
            logger.info("  ✓ Indexes verified")
            
            # ── Migration 4: Add default values for existing rows ────────────
            logger.info("  → Setting default values for existing rows")
            
            # Set empty hashed_password for Firebase users
            conn.execute(text(
                """
                UPDATE users 
                SET hashed_password = '' 
                WHERE firebase_uid IS NOT NULL 
                AND (hashed_password IS NULL OR hashed_password = '')
                """
            ))
            
            # Set default risk_level for old predictions
            if "prediction_logs" in inspector.get_table_names():
                conn.execute(text(
                    """
                    UPDATE prediction_logs 
                    SET risk_level = 'Low' 
                    WHERE risk_level IS NULL OR risk_level = ''
                    """
                ))
            
            conn.commit()
            logger.info("  ✓ Default values set")
        
        logger.info("✅ Database migrations completed successfully")
        return True
        
    except Exception as e:
        logger.error(f"❌ Migration failed: {e}")
        logger.warning("⚠  Continuing startup anyway...")
        return False


def get_migration_status():
    """
    Check which migrations have been applied.
    Returns dict with migration status for monitoring endpoint.
    """
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        status = {
            "tables_exist": {
                "users": "users" in tables,
                "patients": "patients" in tables,
                "prediction_logs": "prediction_logs" in tables,
                "ulcer_images": "ulcer_images" in tables,
                "health_metrics": "health_metrics" in tables,
            },
            "migrations_applied": {}
        }
        
        if "users" in tables:
            user_cols = [col["name"] for col in inspector.get_columns("users")]
            status["migrations_applied"]["firebase_uid"] = "firebase_uid" in user_cols
        
        if "prediction_logs" in tables:
            log_cols = [col["name"] for col in inspector.get_columns("prediction_logs")]
            status["migrations_applied"]["risk_level"] = "risk_level" in log_cols
            status["migrations_applied"]["explanation_text"] = "explanation_text" in log_cols
        
        return status
        
    except Exception as e:
        logger.error(f"Failed to get migration status: {e}")
        return {"error": str(e)}
