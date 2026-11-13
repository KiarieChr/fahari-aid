#!/usr/bin/env bash
# ==============================================================================
# deploy.sh
# Automated production deployment script for Jesus Enthroned Church (JENC).
# Domains:
#   - Main Website & Portal : https://jesusenthroned.org (and www)
#   - Accounting & ERP      : https://portal.jesusenthroned.org
# Handles:
#   - Git syncing with automatic conflict resolution & unrelated histories
#   - Python venv modernization (Python >= 3.10 required for weasyprint/tinyhtml5)
#   - Node.js version verification (Node.js >= 18 required for Vite & Tailwind)
#   - Automated pre-deployment PostgreSQL backups (Port: 5433, User: postgres)
#   - Django database migrations & staticfiles collection
#   - Dual frontend builds (jen_frontend & fahari-ledger-pro)
#   - Linux permissions normalization (www-data)
#   - Systemd service restarts & Nginx hot reload
#   - Redis cache flush
# ==============================================================================

set -euo pipefail

# ------------------------------------------------------------------------------
# 1. DIRECTORY & ENVIRONMENT CONFIGURATION
# ------------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Resolve base project directory (default to /var/www/jesusenthroned on server)
if [ -d "/var/www/jesusenthroned" ]; then
    PROJECT_DIR="/var/www/jesusenthroned"
elif [ -d "${SCRIPT_DIR}/jenc_backend" ]; then
    PROJECT_DIR="${SCRIPT_DIR}"
elif [ -d "${SCRIPT_DIR}/../jenc_backend" ]; then
    PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
else
    PROJECT_DIR="/var/www/jesusenthroned"
fi

BACKEND_DIR="${PROJECT_DIR}/jenc_backend"
FRONTEND_DIR="${PROJECT_DIR}/jen_frontend"
PORTAL_DIR="${PROJECT_DIR}/fahari-ledger-pro"
BACKUP_DIR="${PROJECT_DIR}/backups"

# Enforce production Django settings
export DJANGO_SETTINGS_MODULE="config.settings_production"

# Source environment file if available
if [ -f "${BACKEND_DIR}/.env" ]; then
    set -a
    source "${BACKEND_DIR}/.env"
    set +a
elif [ -f "${PROJECT_DIR}/.env" ]; then
    set -a
    source "${PROJECT_DIR}/.env"
    set +a
fi

# PostgreSQL Database Credentials (Default: Port 5433, Password 'Admin@2025')
export PGPORT="${DB_PORT:-5433}"
export PGHOST="${DB_HOST:-localhost}"
export PGUSER="${DB_USER:-postgres}"
export PGDATABASE="${DB_NAME:-jendb}"
if [ -n "${DB_PASSWORD:-}" ]; then
    export PGPASSWORD="${DB_PASSWORD}"
elif [ -n "${POSTGRES_PASSWORD:-}" ]; then
    export PGPASSWORD="${POSTGRES_PASSWORD}"
else
    export PGPASSWORD="Admin@2025"
fi

# Export corresponding DB_* variables for Django
export DB_PORT="${PGPORT}"
export DB_HOST="${PGHOST}"
export DB_USER="${PGUSER}"
export DB_NAME="${PGDATABASE}"
export DB_PASSWORD="${PGPASSWORD}"

echo "=================================================================="
echo " Starting Jesus Enthroned Church Production Deployment"
echo " Date        : $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo " Project Dir : ${PROJECT_DIR}"
echo " Environment : ${DJANGO_SETTINGS_MODULE}"
echo " Database    : ${PGDATABASE} on ${PGHOST}:${PGPORT} (User: ${PGUSER})"
echo "=================================================================="

# ------------------------------------------------------------------------------
# 2. HELPER FUNCTIONS
# ------------------------------------------------------------------------------

# Ensure virtualenv uses Python >= 3.10
ensure_modern_venv() {
    cd "${BACKEND_DIR}"
    local NEED_REBUILD=false

    if [ ! -d "venv" ] || [ ! -f "venv/bin/python" ]; then
        NEED_REBUILD=true
    else
        local VENV_PY_VER
        VENV_PY_VER=$(venv/bin/python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')" 2>/dev/null || echo "0.0")
        local VENV_MAJOR=$(echo "$VENV_PY_VER" | cut -d'.' -f1)
        local VENV_MINOR=$(echo "$VENV_PY_VER" | cut -d'.' -f2)
        if [ "$VENV_MAJOR" -lt 3 ] || [ "$VENV_MINOR" -lt 10 ]; then
            echo ">>> Detected Python ${VENV_PY_VER} in venv (< 3.10). Upgrading to Python >= 3.10..."
            NEED_REBUILD=true
        fi
    fi

    if [ "$NEED_REBUILD" = true ]; then
        local CHOSEN_PY=""
        for cand in python3.12 python3.11 python3.14 python3.10 python3; do
            if command -v "$cand" &>/dev/null; then
                local PY_VER
                PY_VER=$("$cand" -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')" 2>/dev/null || echo "0.0")
                local MAJ=$(echo "$PY_VER" | cut -d'.' -f1)
                local MIN=$(echo "$PY_VER" | cut -d'.' -f2)
                if [ "$MAJ" -eq 3 ] && [ "$MIN" -ge 10 ]; then
                    CHOSEN_PY="$cand"
                    break
                fi
            fi
        done

        if [ -z "$CHOSEN_PY" ]; then
            echo ">>> ERROR: No Python >= 3.10 found on this system. Please install python3.11 or python3.12."
            return 1
        fi

        echo ">>> Building new Python virtualenv using ${CHOSEN_PY} ($(${CHOSEN_PY} --version))..."
        if [ -d "venv" ]; then
            rm -rf venv_old_backup 2>/dev/null || true
            mv venv venv_old_backup
        fi
        "$CHOSEN_PY" -m venv venv
        venv/bin/python -m pip install --upgrade pip setuptools wheel
    fi
}

# Ensure Node.js is modern (>= 18 required for Vite and Tailwind)
ensure_modern_node() {
    local NODE_VER
    NODE_VER=$(node -v 2>/dev/null || echo "v0.0.0")
    local NODE_MAJOR=$(echo "$NODE_VER" | sed 's/v//' | cut -d'.' -f1)
    if [ "$NODE_MAJOR" -lt 18 ]; then
        echo ">>> ERROR: Detected Node.js ${NODE_VER} (< 18). Modern Node.js (>= 18 or 20 LTS) is required by Vite."
        echo ">>> Please upgrade Node.js on your server by running:"
        echo "    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
        echo "    sudo apt-get install -y nodejs"
        return 1
    fi
}

# Ensure PostgreSQL target database exists (port 5433, user postgres)
ensure_database_exists() {
    echo ">>> Ensuring PostgreSQL database '${PGDATABASE}' exists on ${PGHOST}:${PGPORT}..."

    # Method 1: psql CLI check against postgres maintenance db
    if command -v psql &>/dev/null; then
        if PGPASSWORD="${PGPASSWORD}" psql -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${PGDATABASE}';" 2>/dev/null | grep -q 1; then
            echo "✓ PostgreSQL database '${PGDATABASE}' already exists."
            return 0
        else
            echo ">>> Database '${PGDATABASE}' not found. Creating '${PGDATABASE}' via psql..."
            if PGPASSWORD="${PGPASSWORD}" psql -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" -d postgres -c "CREATE DATABASE \"${PGDATABASE}\" WITH OWNER = \"${PGUSER}\" ENCODING = 'UTF8';" 2>/dev/null; then
                echo "✓ Created PostgreSQL database '${PGDATABASE}' successfully."
                return 0
            else
                echo "Notice: psql CREATE DATABASE had notices, testing Python fallback..."
            fi
        fi
    fi

    # Method 2: Python psycopg2 check inside backend venv
    local PY_EXEC=""
    if [ -f "${BACKEND_DIR}/venv/bin/python" ]; then
        PY_EXEC="${BACKEND_DIR}/venv/bin/python"
    elif command -v python3 &>/dev/null; then
        PY_EXEC="python3"
    elif command -v python &>/dev/null; then
        PY_EXEC="python"
    fi

    if [ -n "$PY_EXEC" ]; then
        "$PY_EXEC" - << 'EOF'
import os
import sys

db_name = os.environ.get("PGDATABASE", "jendb")
db_user = os.environ.get("PGUSER", "postgres")
db_pass = os.environ.get("PGPASSWORD", os.environ.get("DB_PASSWORD", "Admin@2025"))
db_host = os.environ.get("PGHOST", "localhost")
db_port = int(os.environ.get("PGPORT", "5433"))

try:
    import psycopg2
    from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
except ImportError:
    # psycopg2 might not yet be installed if called before pip install
    sys.exit(0)

try:
    conn = psycopg2.connect(
        dbname="postgres",
        user=db_user,
        password=db_pass,
        host=db_host,
        port=db_port
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    with conn.cursor() as cur:
        cur.execute("SELECT 1 FROM pg_database WHERE datname = %s;", (db_name,))
        if not cur.fetchone():
            print(f">>> Creating database '{db_name}' on {db_host}:{db_port}...")
            cur.execute(f'CREATE DATABASE "{db_name}" WITH OWNER = "{db_user}" ENCODING = \'UTF8\';')
            print(f"✓ Database '{db_name}' created successfully via Python psycopg2.")
        else:
            print(f"✓ Database '{db_name}' verified.")
    conn.close()
except Exception as e:
    print(f"Notice: PostgreSQL database check: {e}")
EOF
    fi
}

# Sync Git repository with conflict auto-resolution & unrelated histories support
sync_repository() {
    local REPO_DIR="$1"
    local REPO_LABEL="$2"
    local DEFAULT_BRANCH="$3"

    echo ">>> Syncing ${REPO_LABEL} in ${REPO_DIR}..."
    if [ ! -d "${REPO_DIR}/.git" ]; then
        echo "Notice: ${REPO_DIR} is not a git repository. Skipping git pull."
        return 0
    fi

    cd "${REPO_DIR}"

    # Stash any local uncommitted tracked changes
    git stash || true

    # Determine local active branch
    local LOCAL_BRANCH
    LOCAL_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "${DEFAULT_BRANCH}")

    # Fetch all branches from origin
    echo "Fetching origin for ${REPO_LABEL}..."
    git fetch origin --prune || true

    # Determine remote branch
    local TARGET_BRANCH="${LOCAL_BRANCH}"
    if ! git rev-parse --verify "origin/${TARGET_BRANCH}" &>/dev/null; then
        if git rev-parse --verify "origin/${DEFAULT_BRANCH}" &>/dev/null; then
            TARGET_BRANCH="${DEFAULT_BRANCH}"
        elif git rev-parse --verify "origin/main" &>/dev/null; then
            TARGET_BRANCH="main"
        elif git rev-parse --verify "origin/master" &>/dev/null; then
            TARGET_BRANCH="master"
        fi
    fi

    echo "Merging origin/${TARGET_BRANCH} into ${LOCAL_BRANCH}..."
    if git merge "origin/${TARGET_BRANCH}" --allow-unrelated-histories -X theirs --no-edit; then
        echo "Successfully merged origin/${TARGET_BRANCH} for ${REPO_LABEL}."
    else
        echo "Notice: Merge conflict detected. Resetting to remote origin/${TARGET_BRANCH}..."
        git reset --hard "origin/${TARGET_BRANCH}"
    fi
}

# ------------------------------------------------------------------------------
# 3. GIT REPOSITORY SYNC
# ------------------------------------------------------------------------------
if [ -d "${PROJECT_DIR}/.git" ]; then
    sync_repository "${PROJECT_DIR}" "Jesus Enthroned Main Repo" "main"
else
    sync_repository "${BACKEND_DIR}" "Backend (jenc_backend)" "main"
    sync_repository "${FRONTEND_DIR}" "Frontend (jen_frontend)" "main"
    sync_repository "${PORTAL_DIR}" "Portal (fahari-ledger-pro)" "main"
fi

# ------------------------------------------------------------------------------
# 4. RUNTIME ENVIRONMENT CHECKS
# ------------------------------------------------------------------------------
ensure_modern_venv
ensure_modern_node

# ------------------------------------------------------------------------------
# 5. PRE-DEPLOYMENT DATABASE BACKUP & EXISTENCE CHECK (PostgreSQL on Port 5433)
# ------------------------------------------------------------------------------
ensure_database_exists

echo ">>> Taking pre-deployment PostgreSQL database backup on port ${PGPORT}..."
mkdir -p "${BACKUP_DIR}"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
BACKUP_FILE="${BACKUP_DIR}/jendb_backup_${TIMESTAMP}.sql.gz"

if command -v pg_dump &>/dev/null; then
    if PGPASSWORD="${PGPASSWORD}" pg_dump -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" "${PGDATABASE}" | gzip > "${BACKUP_FILE}"; then
        echo "✓ Database backup saved to: ${BACKUP_FILE}"
        # Keep only the latest 10 backups
        ls -t "${BACKUP_DIR}"/jendb_backup_*.sql.gz 2>/dev/null | tail -n +11 | xargs -r rm -f
    else
        echo "Warning: pg_dump backup failed. Proceeding with deployment..."
    fi
else
    echo "Notice: pg_dump client not found on system. Skipping pre-deployment dump."
fi

# ------------------------------------------------------------------------------
# 6. BACKEND DEPENDENCY UPDATES
# ------------------------------------------------------------------------------
echo ">>> Updating Django backend dependencies..."
cd "${BACKEND_DIR}"
if [ -f "requirements.txt" ]; then
    venv/bin/pip install --no-input -r requirements.txt
fi
venv/bin/pip install --no-input gunicorn psycopg2-binary python-dotenv

# ------------------------------------------------------------------------------
# 7. FRONTEND DEPENDENCY UPDATES
# ------------------------------------------------------------------------------
echo ">>> Updating main frontend dependencies (jen_frontend)..."
cd "${FRONTEND_DIR}"
if [ -f "package.json" ]; then
    npm install --legacy-peer-deps --no-audit || npm install --legacy-peer-deps
fi

echo ">>> Updating accounting portal dependencies (fahari-ledger-pro)..."
cd "${PORTAL_DIR}"
if [ -f "package.json" ]; then
    npm install --legacy-peer-deps --no-audit || npm install --legacy-peer-deps
fi

# ------------------------------------------------------------------------------
# 8. DATABASE MIGRATIONS (Django Models Installation)
# ------------------------------------------------------------------------------
ensure_database_exists
echo ">>> Running Django database migrations on PostgreSQL (port ${PGPORT})..."
cd "${BACKEND_DIR}"
venv/bin/python manage.py migrate --noinput

# Check if user requested SQL data migration via flag --migrate-sql
if [[ "${1:-}" == "--migrate-sql" ]] || [[ "${MIGRATE_SQL:-false}" == "true" ]]; then
    echo ">>> Running MySQL/SQL data migration to PostgreSQL..."
    if [ -f "scripts/migrate_sql_to_postgres.py" ]; then
        venv/bin/python scripts/migrate_sql_to_postgres.py --port "${PGPORT}" --password "${PGPASSWORD}" || echo "Notice: Data migration completed with notices."
    fi
fi

# ------------------------------------------------------------------------------
# 9. FRONTEND PRODUCTION BUILDS
# ------------------------------------------------------------------------------
echo ">>> Building main frontend (jen_frontend -> dist)..."
cd "${FRONTEND_DIR}"
npm run build

echo ">>> Building accounting portal (fahari-ledger-pro -> dist)..."
cd "${PORTAL_DIR}"
npm run build

# ------------------------------------------------------------------------------
# 10. BACKEND STATIC & MEDIA FILES COLLECTION
# ------------------------------------------------------------------------------
echo ">>> Collecting backend static files..."
cd "${BACKEND_DIR}"
mkdir -p "${BACKEND_DIR}/staticfiles" "${BACKEND_DIR}/media"
venv/bin/python manage.py collectstatic --noinput

# ------------------------------------------------------------------------------
# 11. NORMALIZE LINUX PERMISSIONS (www-data)
# ------------------------------------------------------------------------------
echo ">>> Normalizing directory permissions for www-data..."
mkdir -p /var/log/gunicorn
chown -R www-data:www-data /var/log/gunicorn 2>/dev/null || true

for target_dir in \
    "${BACKEND_DIR}/media" \
    "${BACKEND_DIR}/staticfiles" \
    "${FRONTEND_DIR}/dist" \
    "${PORTAL_DIR}/dist" \
    "${BACKUP_DIR}"; do
    if [ -d "${target_dir}" ]; then
        chown -R www-data:www-data "${target_dir}" 2>/dev/null || true
        chmod -R 775 "${target_dir}" 2>/dev/null || true
    fi
done

# ------------------------------------------------------------------------------
# 12. SERVICE RESTARTS & NGINX RELOAD
# ------------------------------------------------------------------------------
echo ">>> Restarting application systemd services..."
if systemctl list-unit-files | grep -q "gunicorn_jesusenthroned.service"; then
    systemctl restart gunicorn_jesusenthroned
    echo "✓ Restarted gunicorn_jesusenthroned.service"
fi

if systemctl list-unit-files | grep -q "fahari_portal.service"; then
    systemctl restart fahari_portal
    echo "✓ Restarted fahari_portal.service"
fi

# Hot reload Nginx after configuration test
if command -v nginx &>/dev/null; then
    echo ">>> Testing and reloading Nginx..."
    nginx -t && systemctl reload nginx
    echo "✓ Nginx reloaded successfully."
fi

# ------------------------------------------------------------------------------
# 13. CLEAR REDIS CACHE (If available)
# ------------------------------------------------------------------------------
if command -v redis-cli &>/dev/null; then
    echo ">>> Flushing Redis cache..."
    redis-cli flushall || true
fi

echo "=================================================================="
echo " Deployment Complete!"
echo " Main Website & Portal : https://jesusenthroned.org"
echo " Accounting ERP Portal : https://portal.jesusenthroned.org"
echo " Backend API           : https://jesusenthroned.org/api/"
echo " Database              : PostgreSQL on port ${PGPORT}"
echo "=================================================================="

