#!/usr/bin/env python3
"""
==============================================================================
migrate_sql_to_postgres.py
Automated script to migrate MySQL / phpMyAdmin SQL dump data to PostgreSQL
for Jesus Enthroned Church (jenc_backend).
==============================================================================
- Default PostgreSQL Port: 5433 (or via PGPORT / DB_PORT)
- Default Password: Admin@2025 (or via PGPASSWORD / DB_PASSWORD)
- Normalizes MySQL escaping, zero-dates, boolean casting
- Bypasses foreign key order constraints using session_replication_role
- Inserts with ON CONFLICT DO NOTHING to avoid duplicate key errors
- Synchronizes all auto-increment PK sequences at completion
==============================================================================
"""

import os
import re
import sys
import argparse
from pathlib import Path
import psycopg2

# Configure console encoding
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

EXCLUDED_TABLES = {'cities', 'countries', 'states', 'regions', 'subregions'}


def parse_args():
    parser = argparse.ArgumentParser(description="Migrate MySQL dump to PostgreSQL for JENC backend.")
    parser.add_argument(
        'dump_file',
        nargs='?',
        default=None,
        help="Path to the MySQL/phpMyAdmin .sql dump file (e.g. db/nprfojqc_jenc_cleaned.sql)"
    )
    parser.add_argument(
        '--host',
        default=os.environ.get('PGHOST', os.environ.get('DB_HOST', 'localhost')),
        help="Postgres host (default: localhost)"
    )
    parser.add_argument(
        '--port',
        type=int,
        default=int(os.environ.get('PGPORT', os.environ.get('DB_PORT', 5433))),
        help="Postgres port (default: 5433)"
    )
    parser.add_argument(
        '--user',
        default=os.environ.get('PGUSER', os.environ.get('DB_USER', 'postgres')),
        help="Postgres user (default: postgres)"
    )
    parser.add_argument(
        '--password',
        default=os.environ.get('PGPASSWORD', os.environ.get('DB_PASSWORD', 'Admin@2025')),
        help="Postgres password (default: 'Admin@2025')"
    )
    parser.add_argument(
        '--dbname',
        default=os.environ.get('PGDATABASE', os.environ.get('DB_NAME', 'jendb')),
        help="Postgres database name (default: jendb)"
    )
    return parser.parse_args()


def clean_dump(sql_text: str) -> str:
    """Normalize MySQL dialect to PostgreSQL compatible syntax."""
    # Strip phpMyAdmin comment headers
    sql_text = re.sub(r'^--.*$', '', sql_text, flags=re.MULTILINE)
    sql_text = re.sub(r'/\*!.*?\*/;?', '', sql_text, flags=re.DOTALL)

    # Strip MySQL transactions/locks
    sql_text = re.sub(r'^SET\s+.*?;$', '', sql_text, flags=re.MULTILINE | re.IGNORECASE)
    sql_text = re.sub(r'^(START TRANSACTION|COMMIT|LOCK TABLES|UNLOCK TABLES).*?;$', '', sql_text, flags=re.MULTILINE | re.IGNORECASE)

    # Drop CREATE/ALTER blocks (Django models/migrations maintain the schema)
    sql_text = re.sub(r'CREATE TABLE\s+`?\w+`?\s*\(.*?\)\s*ENGINE.*?;', '', sql_text, flags=re.DOTALL | re.IGNORECASE)
    sql_text = re.sub(r'ALTER TABLE\s+`?\w+`?\s*.*?;', '', sql_text, flags=re.DOTALL | re.IGNORECASE)

    # Convert backticks to double quotes
    sql_text = sql_text.replace('`', '"')

    # Convert MySQL escapes
    sql_text = sql_text.replace(r"\'", "''")
    sql_text = sql_text.replace(r'\"', '"')
    sql_text = sql_text.replace(r'\0', '')
    sql_text = sql_text.replace(r'\\', '\\')

    # Normalize invalid MySQL zero dates
    sql_text = re.sub(r"'0000-00-00(\s+00:00:00)?'", 'NULL', sql_text)

    return sql_text


def split_statements(sql: str) -> list[str]:
    """Split statements safely respecting quotes and escapes."""
    statements = []
    buf = []
    in_string = False
    str_char = ''
    escape = False

    for ch in sql:
        if escape:
            buf.append(ch)
            escape = False
            continue
        if ch == '\\' and in_string:
            buf.append(ch)
            escape = True
            continue
        if ch in ("'", '"'):
            if not in_string:
                in_string = True
                str_char = ch
            elif ch == str_char:
                in_string = False
            buf.append(ch)
            continue
        if ch == ';' and not in_string:
            stmt = ''.join(buf).strip()
            if stmt:
                statements.append(stmt)
            buf = []
            continue
        buf.append(ch)

    tail = ''.join(buf).strip()
    if tail:
        statements.append(tail)
    return statements


def get_target_table(stmt: str) -> str | None:
    """Extract table name from INSERT statement."""
    m = re.match(r'^INSERT\s+INTO\s+"?(\w+)"?', stmt, re.IGNORECASE)
    if m:
        return m.group(1).lower()
    return None


def find_default_dump() -> Path | None:
    """Look for pre-existing dump files in project."""
    candidates = [
        Path('db/nprfojqc_jenc_cleaned.sql'),
        Path('../db/nprfojqc_jenc_cleaned.sql'),
        Path('../../db/nprfojqc_jenc_cleaned.sql'),
        Path('db/nprfojqc_jenc (2).sql'),
        Path('../db/nprfojqc_jenc (2).sql'),
        Path('db/nprfojqc_jenc_phases1_to_4_data.sql'),
        Path('../db/nprfojqc_jenc_phases1_to_4_data.sql'),
    ]
    for cand in candidates:
        if cand.exists():
            return cand
    return None


def ensure_database_exists(args):
    """Ensure target database exists, creating it via postgres maintenance DB if needed."""
    from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
    try:
        m_conn = psycopg2.connect(
            host=args.host,
            port=args.port,
            user=args.user,
            password=args.password,
            dbname='postgres'
        )
        m_conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        with m_conn.cursor() as cur:
            cur.execute("SELECT 1 FROM pg_database WHERE datname = %s;", (args.dbname,))
            if not cur.fetchone():
                print(f">>> Database '{args.dbname}' does not exist on {args.host}:{args.port}. Creating it...")
                cur.execute(f'CREATE DATABASE "{args.dbname}" WITH OWNER = %s ENCODING = \'UTF8\';', (args.user,))
                print(f"✓ Database '{args.dbname}' created successfully.")
            else:
                print(f"✓ Database '{args.dbname}' verified.")
        m_conn.close()
    except Exception as e:
        print(f"Notice on database pre-check: {e}")


def main():
    args = parse_args()

    dump_path = None
    if args.dump_file:
        dump_path = Path(args.dump_file)
    else:
        dump_path = find_default_dump()

    if not dump_path or not dump_path.exists():
        sys.exit(
            "Error: No SQL dump file provided or found.\n"
            "Usage: python migrate_sql_to_postgres.py <path_to_dump.sql> [--port 5433] [--password 'Admin@2025']"
        )

    print("==================================================================")
    print(" JENC: MySQL Data -> PostgreSQL Migration")
    print(f" Source File : {dump_path.resolve()}")
    print(f" Target Host : {args.host}:{args.port}")
    print(f" Database    : {args.dbname} (User: {args.user})")
    print("==================================================================")

    # Automatically ensure the database exists before connecting to it
    ensure_database_exists(args)

    try:
        conn = psycopg2.connect(
            host=args.host,
            port=args.port,
            user=args.user,
            password=args.password,
            dbname=args.dbname
        )
        conn.autocommit = False
    except Exception as e:
        sys.exit(f"Failed to connect to PostgreSQL at {args.host}:{args.port}: {e}")

    try:
        with conn.cursor() as cur:
            # 1. Enable implicit integer to boolean casting
            try:
                cur.execute(
                    "UPDATE pg_cast SET castcontext = 'i' "
                    "WHERE castsource = 'integer'::regtype AND casttarget = 'boolean'::regtype;"
                )
                conn.commit()
                print("✓ Enabled implicit integer-to-boolean casting in PostgreSQL.")
            except Exception as e:
                conn.rollback()
                print(f"Notice on implicit cast: {e}")

            # 2. Ensure default values for CustomUser columns
            try:
                cur.execute("""
                    ALTER TABLE users ALTER COLUMN is_superuser SET DEFAULT false;
                    ALTER TABLE users ALTER COLUMN is_staff SET DEFAULT false;
                    ALTER TABLE users ALTER COLUMN is_active SET DEFAULT true;
                    ALTER TABLE users ALTER COLUMN first_name SET DEFAULT '';
                    ALTER TABLE users ALTER COLUMN last_name SET DEFAULT '';
                    ALTER TABLE users ALTER COLUMN date_joined SET DEFAULT now();
                """)
                conn.commit()
                print("✓ Ensured default values for Django CustomUser fields.")
            except Exception as e:
                conn.rollback()
                print(f"Notice on CustomUser defaults: {e}")

            # 3. Read existing public tables
            cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
            existing_tables = {r[0].lower() for r in cur.fetchall()}
            print(f"✓ Found {len(existing_tables)} existing tables in '{args.dbname}'.")

            # 4. Clean and parse dump
            print(f">>> Reading {dump_path.name}...")
            raw_content = dump_path.read_text(encoding='utf-8', errors='ignore')

            print(">>> Cleaning MySQL dialect...")
            cleaned = clean_dump(raw_content)

            print(">>> Splitting SQL statements...")
            all_stmts = split_statements(cleaned)

            stmts_to_run = []
            skipped_excluded = 0
            skipped_missing = 0

            for stmt in all_stmts:
                tbl = get_target_table(stmt)
                if not tbl:
                    stmts_to_run.append(stmt)
                    continue

                if tbl in EXCLUDED_TABLES:
                    skipped_excluded += 1
                    continue

                if tbl not in existing_tables:
                    skipped_missing += 1
                    continue

                stmt_clean = stmt.rstrip(';').strip()
                if 'ON CONFLICT' not in stmt_clean.upper():
                    stmt_clean += ' ON CONFLICT DO NOTHING'
                stmts_to_run.append(stmt_clean + ';')

            print(f"✓ Retained {len(stmts_to_run)} valid statements.")
            if skipped_excluded:
                print(f"  Skipped {skipped_excluded} excluded geography statements.")
            if skipped_missing:
                print(f"  Skipped {skipped_missing} statements for non-Django tables.")

            # 5. Disable constraints during bulk insert
            cur.execute("SET session_replication_role = 'replica';")

            success = 0
            failed = 0

            print(">>> Executing data migration...")
            for idx, stmt in enumerate(stmts_to_run, start=1):
                try:
                    cur.execute(stmt)
                    success += 1
                except Exception as e:
                    conn.rollback()
                    cur.execute("SET session_replication_role = 'replica';")
                    failed += 1
                    err_msg = str(e).strip().split('\n')[0]
                    print(f"[FAIL #{idx}] {err_msg}")
                else:
                    if success % 25 == 0:
                        conn.commit()
                        cur.execute("SET session_replication_role = 'replica';")
                        print(f"  Processed {success}/{len(stmts_to_run)} statements...")

            conn.commit()

            # Restore constraint enforcement
            cur.execute("SET session_replication_role = 'origin';")
            conn.commit()
            print(f"\n✓ Import finished: {success} successful, {failed} failed.")

            # 6. Re-synchronize auto-increment sequences
            print(">>> Synchronizing primary key sequences...")
            cur.execute("""
                DO $$
                DECLARE
                    rec RECORD;
                BEGIN
                    FOR rec IN
                        SELECT c.relname AS table_name,
                               a.attname AS column_name,
                               pg_get_serial_sequence(c.oid::regclass::text, a.attname) AS seq
                        FROM pg_class c
                        JOIN pg_attribute a ON a.attrelid = c.oid
                        JOIN pg_namespace n ON n.oid = c.relnamespace
                        WHERE c.relkind = 'r'
                          AND n.nspname = 'public'
                          AND a.attnum > 0
                          AND NOT a.attisdropped
                          AND pg_get_serial_sequence(c.oid::regclass::text, a.attname) IS NOT NULL
                    LOOP
                        EXECUTE format(
                            'SELECT setval(%L, COALESCE((SELECT MAX(%I) FROM %I), 1), true)',
                            rec.seq, rec.column_name, rec.table_name
                        );
                    END LOOP;
                END $$;
            """)
            conn.commit()
            print("✓ All auto-increment primary key sequences synchronized.")

    finally:
        conn.close()

    print("==================================================================")
    print(" Migration to PostgreSQL (port: %d) Completed Successfully!" % args.port)
    print("==================================================================")


if __name__ == '__main__':
    main()

