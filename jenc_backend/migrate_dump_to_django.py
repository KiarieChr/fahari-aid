"""
Migrate cleaned phpMyAdmin dump directly into PostgreSQL Django models.
Excludes: cities, countries, states, regions, subregions, and any table not in Django.
Automatically handles boolean casting (0/1 -> FALSE/TRUE), default values for Django CustomUser,
and ON CONFLICT DO NOTHING handling.
"""
import os
import re
import sys
from pathlib import Path
import psycopg2

# Ensure UTF-8 output on Windows console
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

PG_CONFIG = {
    'host': os.environ.get('PG_HOST', '127.0.0.1'),
    'port': int(os.environ.get('PG_PORT', 5432)),
    'user': os.environ.get('PG_USER', 'postgres'),
    'password': os.environ.get('PG_PASSWORD', '6820'),
    'dbname': os.environ.get('PG_DB', 'jendb'),
}

EXCLUDED_TABLES = {'cities', 'countries', 'states', 'regions', 'subregions'}


def clean_dump(sql_text: str) -> str:
    """Normalize MySQL syntax to PostgreSQL-compatible SQL."""
    # Strip phpMyAdmin comment markers
    sql_text = re.sub(r'^--.*$', '', sql_text, flags=re.MULTILINE)
    sql_text = re.sub(r'/\*!.*?\*/;?', '', sql_text, flags=re.DOTALL)
    
    # Strip MySQL SET/LOCK statements
    sql_text = re.sub(r'^SET\s+.*?;$', '', sql_text, flags=re.MULTILINE | re.IGNORECASE)
    sql_text = re.sub(r'^(START TRANSACTION|COMMIT|LOCK TABLES|UNLOCK TABLES).*?;$', '', sql_text, flags=re.MULTILINE | re.IGNORECASE)
    
    # Drop CREATE/ALTER blocks if present (Django migrations manage schema)
    sql_text = re.sub(r'CREATE TABLE\s+`?\w+`?\s*\(.*?\)\s*ENGINE.*?;', '', sql_text, flags=re.DOTALL | re.IGNORECASE)
    sql_text = re.sub(r'ALTER TABLE\s+`?\w+`?\s*.*?;', '', sql_text, flags=re.DOTALL | re.IGNORECASE)

    # Convert identifier backticks to double quotes
    sql_text = sql_text.replace('`', '"')

    # Convert escapes: MySQL \' to Standard SQL ''
    sql_text = sql_text.replace(r"\'", "''")
    sql_text = sql_text.replace(r'\"', '"')
    sql_text = sql_text.replace(r'\0', '')
    sql_text = sql_text.replace(r'\\', '\\')

    # Normalize zero-dates
    sql_text = re.sub(r"'0000-00-00(\s+00:00:00)?'", 'NULL', sql_text)

    return sql_text


def split_statements(sql: str) -> list[str]:
    """Parse statements safely respecting quoted semicolons."""
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
    """Extract target table name from an INSERT statement."""
    m = re.match(r'^INSERT\s+INTO\s+"?(\w+)"?', stmt, re.IGNORECASE)
    if m:
        return m.group(1).lower()
    return None


def main():
    if len(sys.argv) < 2:
        sys.exit("Usage: python migrate_dump_to_django.py <path_to_dump.sql>")

    dump_path = Path(sys.argv[1])
    if not dump_path.exists():
        sys.exit(f"File not found: {dump_path}")

    print(f"Connecting to Postgres database '{PG_CONFIG['dbname']}'...")
    conn = psycopg2.connect(**PG_CONFIG)
    conn.autocommit = False

    try:
        with conn.cursor() as cur:
            # 1. Ensure integer-to-boolean implicit casting in PostgreSQL
            try:
                cur.execute("UPDATE pg_cast SET castcontext = 'i' WHERE castsource = 'integer'::regtype AND casttarget = 'boolean'::regtype;")
                conn.commit()
                print("Enabled implicit integer-to-boolean casting in PostgreSQL.")
            except Exception as e:
                conn.rollback()
                print(f"Notice on implicit cast setting: {e}")

            # 2. Ensure default values for Django CustomUser columns not present in legacy MySQL
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
                print("Ensured default values for Django CustomUser fields.")
            except Exception as e:
                conn.rollback()
                print(f"Notice on CustomUser defaults: {e}")

            # 3. Get list of existing tables in Django database
            cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
            existing_tables = {r[0].lower() for r in cur.fetchall()}
            print(f"Found {len(existing_tables)} existing tables in '{PG_CONFIG['dbname']}'.")

            print(f"Reading {dump_path.name}...")
            raw_content = dump_path.read_text(encoding='utf-8', errors='ignore')

            print("Cleaning MySQL dialect...")
            cleaned = clean_dump(raw_content)

            print("Splitting statements...")
            all_stmts = split_statements(cleaned)

            # 4. Filter and prepare statements
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

                # Add ON CONFLICT DO NOTHING if not present
                stmt_clean = stmt.rstrip(';').strip()
                if 'ON CONFLICT' not in stmt_clean.upper():
                    stmt_clean += ' ON CONFLICT DO NOTHING'
                stmts_to_run.append(stmt_clean + ';')

            print(f"Retained {len(stmts_to_run)} valid statements.")
            print(f"Skipped {skipped_excluded} excluded geography statements.")
            print(f"Skipped {skipped_missing} statements for non-Django tables.")

            # Disable constraint checking for bulk insertion
            cur.execute("SET session_replication_role = 'replica';")

            success = 0
            fail = 0

            for idx, stmt in enumerate(stmts_to_run, start=1):
                try:
                    cur.execute(stmt)
                    success += 1
                except Exception as e:
                    conn.rollback()
                    cur.execute("SET session_replication_role = 'replica';")
                    fail += 1
                    err_msg = str(e).encode('ascii', errors='backslashreplace').decode('ascii')
                    preview = stmt[:160].encode('ascii', errors='backslashreplace').decode('ascii')
                    print(f"\n[FAIL] Statement #{idx}: {err_msg}")
                    print(f"       Query preview: {preview}...")
                else:
                    if success % 10 == 0:
                        conn.commit()
                        cur.execute("SET session_replication_role = 'replica';")
                        print(f"  Inserted {success}/{len(stmts_to_run)} statements...")

            conn.commit()

            # Restore normal constraint checking
            cur.execute("SET session_replication_role = 'origin';")
            conn.commit()

            print(f"\nFinished import: {success} executed successfully, {fail} failed.")

            # Automatically resynchronize all primary key sequences
            print("Syncing primary key sequences...")
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
            print("All sequences synchronized successfully.")

    finally:
        conn.close()


if __name__ == '__main__':
    main()
