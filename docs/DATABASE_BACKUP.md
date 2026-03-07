# Database Backup & Restore

## Automated Backups

Railway and most managed PostgreSQL providers (Neon, Supabase, etc.) include automated daily backups. Verify this is enabled in your provider's dashboard.

## Manual Backup

### Create a backup
```bash
# From a machine with access to the production database
pg_dump "$DATABASE_URL" --format=custom --file=backup_$(date +%Y%m%d_%H%M%S).dump
```

### Upload to secure storage
```bash
# Example: upload to S3
aws s3 cp backup_*.dump s3://clearmoney-backups/postgres/
```

## Restore

### Restore to a fresh database
```bash
pg_restore --dbname="$TARGET_DATABASE_URL" --clean --if-exists backup_YYYYMMDD_HHMMSS.dump
```

### Restore to the existing database (destructive)
```bash
# WARNING: This will overwrite current data
pg_restore --dbname="$DATABASE_URL" --clean --if-exists backup_YYYYMMDD_HHMMSS.dump
```

## Backup Schedule

| Backup Type | Frequency | Retention |
|-------------|-----------|-----------|
| Provider automated | Daily | 7 days (verify with provider) |
| Manual pre-migration | Before each Alembic migration | 30 days |
| Manual pre-deploy | Before major releases | 30 days |

## Verification

Periodically test that backups can be restored:
```bash
# Create a test database and restore into it
createdb clearmoney_restore_test
pg_restore --dbname=clearmoney_restore_test backup_latest.dump
# Verify data, then drop
dropdb clearmoney_restore_test
```
