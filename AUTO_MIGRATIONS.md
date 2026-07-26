# 🔄 Automatic Database Migrations

**For Render Free Tier (No Shell Access)**

---

## Overview

This system automatically updates your database schema on every deployment. No manual shell commands required!

### What It Does:
✅ Creates new tables  
✅ Adds missing columns to existing tables  
✅ Creates indexes for performance  
✅ Sets default values  
✅ Safe to run multiple times (idempotent)  

---

## How It Works

### 1. On Every Startup

When your backend starts, it automatically:

```python
# backend/app/main.py (lifespan function)
1. Create tables (if they don't exist)
2. Run migrations (add columns, indexes, etc.)
3. Verify database connection
4. Start serving requests
```

### 2. Migration File

All migrations are in: `backend/app/migrations.py`

Current migrations:
- ✅ Add `firebase_uid` column to `users` table
- ✅ Add `risk_level` column to `prediction_logs` table  
- ✅ Add `explanation_text` column to `prediction_logs` table
- ✅ Create indexes for performance
- ✅ Set default values for existing rows

### 3. Check Migration Status

**Endpoint:** `GET /diagnostics/health`

Returns:
```json
{
  "status": "healthy",
  "database": "connected",
  "users_count": 5,
  "migrations": {
    "tables_exist": {
      "users": true,
      "patients": true,
      "prediction_logs": true
    },
    "migrations_applied": {
      "firebase_uid": true,
      "risk_level": true,
      "explanation_text": true
    }
  }
}
```

---

## Adding New Migrations

When you need to change the database schema in future:

### Step 1: Update Model

Edit `backend/app/models.py`:

```python
class User(Base):
    __tablename__ = "users"
    
    # ... existing columns ...
    
    # NEW COLUMN
    phone_number = Column(String, nullable=True)
```

### Step 2: Add Migration

Edit `backend/app/migrations.py`:

```python
def run_migrations():
    # ... existing migrations ...
    
    # ── Migration X: Add phone_number to users ───────────────
    if "users" in inspector.get_table_names():
        columns = [col["name"] for col in inspector.get_columns("users")]
        
        if "phone_number" not in columns:
            logger.info("  → Adding phone_number column to users")
            conn.execute(text(
                "ALTER TABLE users ADD COLUMN phone_number VARCHAR"
            ))
            conn.commit()
            logger.info("  ✓ phone_number column added")
```

### Step 3: Deploy

```bash
git add .
git commit -m "feat: Add phone_number to users"
git push origin main
```

Render will:
1. Build new image
2. Start container
3. Run migrations automatically
4. Your new column is live! ✅

---

## Migration Patterns

### Add a Column

```python
if "column_name" not in columns:
    conn.execute(text(
        "ALTER TABLE table_name ADD COLUMN column_name VARCHAR"
    ))
    conn.commit()
```

### Add an Index

```python
# PostgreSQL
conn.execute(text(
    "CREATE INDEX IF NOT EXISTS ix_table_column ON table(column)"
))

# SQLite
conn.execute(text(
    "CREATE INDEX IF NOT EXISTS ix_table_column ON table(column)"
))
```

### Set Default Values

```python
conn.execute(text(
    """
    UPDATE table_name 
    SET column_name = 'default_value' 
    WHERE column_name IS NULL
    """
))
conn.commit()
```

### Make a Column Unique

```python
# PostgreSQL
conn.execute(text(
    "ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email)"
))

# SQLite - requires recreating table (more complex)
# Better to include UNIQUE in initial column definition
```

---

## Safety Features

### 1. Idempotent
Migrations check if changes already exist before applying:
```python
if "firebase_uid" not in columns:
    # Only add if not already present
    conn.execute(...)
```

### 2. Error Handling
If a migration fails:
- Logs the error
- Continues startup anyway
- App remains functional

### 3. Transaction Safety
Each migration uses transactions:
```python
conn.execute(...)
conn.commit()  # Only commits if successful
```

### 4. Logging
Every migration logs its actions:
```
INFO: 🔄 Running database migrations...
INFO:   → Adding firebase_uid column to users table
INFO:   ✓ firebase_uid column added
INFO: ✅ Database migrations completed successfully
```

---

## Testing Migrations Locally

### Test SQLite (Development)

```bash
# Start backend
cd backend
uvicorn app.main:app --reload

# Check logs for:
# "Running database migrations..."
# "✓ firebase_uid column added"
```

### Test PostgreSQL (Production-like)

```bash
# Use docker-compose
docker-compose up

# Or connect to real PostgreSQL
DATABASE_URL="postgresql://user:pass@localhost/db" uvicorn app.main:app
```

### Verify Migration Applied

```bash
curl http://localhost:8000/diagnostics/health | jq .migrations
```

---

## Render Deployment

### First Deployment

1. Push to GitHub
2. Render creates services (via render.yaml)
3. Backend starts:
   - Creates all tables
   - Runs all migrations
   - ✅ Database ready!

### Subsequent Deployments

1. Add new migration to `migrations.py`
2. Push to GitHub
3. Render rebuilds:
   - Existing tables preserved
   - Only new changes applied
   - ✅ Zero downtime!

---

## Troubleshooting

### ❌ "Migration failed: column already exists"

**Cause:** Migration ran twice or manually added column

**Fix:** Update migration to check first:
```python
if "column_name" not in columns:
    conn.execute(...)
```

### ❌ "Migration failed: permission denied"

**Cause:** Database user doesn't have ALTER permission

**Fix:** 
- Render PostgreSQL: Should have full permissions ✅
- External DB: Grant ALTER privilege to your user

### ❌ "Migration failed: cannot alter column type"

**Cause:** Trying to change existing column type

**Fix:** More complex - requires multi-step migration:
1. Add new column with new type
2. Copy data with conversion
3. Drop old column
4. Rename new column

**Example:**
```python
# Step 1
conn.execute(text("ALTER TABLE users ADD COLUMN age_new INTEGER"))
# Step 2
conn.execute(text("UPDATE users SET age_new = CAST(age AS INTEGER)"))
# Step 3
conn.execute(text("ALTER TABLE users DROP COLUMN age"))
# Step 4
conn.execute(text("ALTER TABLE users RENAME COLUMN age_new TO age"))
```

### ❌ "Table doesn't exist"

**Cause:** Migrations ran before table creation

**Fix:** Always check if table exists:
```python
if "users" in inspector.get_table_names():
    # Safe to proceed
```

---

## Best Practices

### ✅ DO

- Always check if column/index exists before adding
- Use transactions (`conn.commit()`)
- Log every migration step
- Test locally before deploying
- Keep migrations simple and focused

### ❌ DON'T

- Don't drop columns (breaks old code)
- Don't rename columns without deprecation period
- Don't change column types (migrate data first)
- Don't assume tables exist
- Don't hard-code values (use variables)

---

## Migration Checklist

When adding a new migration:

- [ ] Update model in `models.py`
- [ ] Add migration function in `migrations.py`
- [ ] Check if column/table exists before modifying
- [ ] Add logging statements
- [ ] Test locally with SQLite
- [ ] Test with PostgreSQL (docker-compose)
- [ ] Check `/diagnostics/health` endpoint
- [ ] Commit and push
- [ ] Verify in Render logs after deployment

---

## Future Enhancements

### Version Tracking

Add a `migrations` table to track which migrations ran:

```python
class Migration(Base):
    __tablename__ = "migrations"
    
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True)
    applied_at = Column(DateTime, default=datetime.utcnow)
```

Then check:
```python
if not migration_already_applied("add_firebase_uid"):
    # Run migration
    mark_migration_applied("add_firebase_uid")
```

### Rollback Support

Add downgrade functions:
```python
def upgrade_001():
    # Add column
    pass

def downgrade_001():
    # Remove column
    pass
```

### Migration Files

Split into separate files:
```
backend/migrations/
  001_add_firebase_uid.py
  002_add_risk_level.py
  003_add_indexes.py
```

---

## Summary

✅ **Automatic migrations run on every deployment**  
✅ **No shell access required**  
✅ **Safe to run multiple times**  
✅ **Check status at `/diagnostics/health`**  
✅ **Add new migrations in `migrations.py`**  

Your database schema stays up-to-date automatically! 🎉

---

<div align="center">

**Questions?** Check the code in `backend/app/migrations.py`

</div>
