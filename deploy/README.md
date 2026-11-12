# Jesus Enthroned Church (JENC) & Fahari Ledger Pro Production Deployment Guide

This directory contains the production deployment automation for:
- **Main Website & Member Portal**: `https://jesusenthroned.org` and `https://www.jesusenthroned.org`
- **Accounting & ERP Portal**: `https://portal.jesusenthroned.org` (and `https://porta.jesusenthroned.org`)
- **Backend API (Django REST Framework)**: `https://jesusenthroned.org/api/`
- **Database**: PostgreSQL on **Port 5433** with user `postgres` and password `Admin @2025`

---

## Architecture Overview

```
                          Internet (HTTPS / Port 443)
                                       │
                                       ▼
                       Nginx Reverse Proxy & Static Server
                     (/etc/nginx/sites-available/jesusenthroned.conf)
                                       │
          ┌────────────────────────────┼────────────────────────────┐
          ▼                            ▼                            ▼
  jesusenthroned.org       portal.jesusenthroned.org       /api/ & /admin/
   (jen_frontend/dist)      (fahari-ledger-pro/dist)      (jenc_backend:8000)
   Single-Page App             Accounting Portal           Gunicorn WSGI Server
                                                                    │
                                                                    ▼
                                                            PostgreSQL (Port 5433)
                                                            Database: jendb
                                                            User: postgres
                                                            Password: Admin @2025
```

---

## 1. Server Prerequisites (Ubuntu 22.04 / 24.04 LTS)

Run as `root` or `sudo`:

```bash
# 1. Update OS packages
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install Python >= 3.11, build tools, libpq for PostgreSQL, weasyprint dependencies
sudo apt-get install -y python3.11 python3.11-venv python3.11-dev python3-pip \
    build-essential libpq-dev libpango-1.0-0 libpangoft2-1.0-0 libharfbuzz0b \
    libjpeg-dev libopenjp2-7-dev libffi-dev nginx redis-server git curl

# 3. Install Node.js 20 LTS (required for Vite & Tailwind v4)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Verify Node.js and Python versions
node -v    # Must be >= v18.0.0 (e.g. v20.x.x)
python3 -V # Must be >= 3.10 (e.g. 3.11 or 3.12)
```

---

## 2. PostgreSQL Configuration on Port 5433

If your PostgreSQL is running on standard port 5432, you can configure a cluster or instance on **port 5433**:

```bash
# Set postgres password to 'Admin @2025' and create jendb database
sudo -u postgres psql -p 5433 -c "ALTER USER postgres WITH PASSWORD 'Admin @2025';"
sudo -u postgres psql -p 5433 -c "CREATE DATABASE jendb OWNER postgres;"

# If PostgreSQL is listening on 5432, you can change the port in /etc/postgresql/<version>/main/postgresql.conf:
# port = 5433
# sudo systemctl restart postgresql
```

---

## 3. Directory Layout on Production Server

Place the repository in `/var/www/jesusenthroned`:

```
/var/www/jesusenthroned/
├── deploy/
│   ├── deploy.sh
│   ├── nginx/
│   │   └── jesusenthroned.conf
│   ├── systemd/
│   │   ├── gunicorn_jesusenthroned.service
│   │   └── fahari_portal.service
│   └── .env.production.example
├── deploy.sh -> deploy/deploy.sh
├── jenc_backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── config/
│   │   ├── settings.py
│   │   └── settings_production.py
│   └── scripts/
│       └── migrate_sql_to_postgres.py
├── jen_frontend/
└── fahari-ledger-pro/
```

---

## 4. Install Systemd Services & Nginx

```bash
# 1. Copy systemd service files
sudo cp /var/www/jesusenthroned/deploy/systemd/gunicorn_jesusenthroned.service /etc/systemd/system/
sudo cp /var/www/jesusenthroned/deploy/systemd/fahari_portal.service /etc/systemd/system/

# 2. Reload systemd daemon & enable services
sudo systemctl daemon-reload
sudo systemctl enable gunicorn_jesusenthroned
sudo systemctl enable fahari_portal

# 3. Enable Nginx configuration
sudo cp /var/www/jesusenthroned/deploy/nginx/jesusenthroned.conf /etc/nginx/sites-available/jesusenthroned.conf
sudo ln -sf /etc/nginx/sites-available/jesusenthroned.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

---

## 5. Running the Automated Deployment Script

Make `deploy.sh` executable and run it:

```bash
cd /var/www/jesusenthroned
chmod +x deploy.sh deploy/deploy.sh

# Normal deployment (pulls code, migrates, builds frontends, restarts services):
./deploy.sh

# First-time deployment including MySQL to PostgreSQL data migration:
./deploy.sh --migrate-sql
```

---

## 6. SSL Certificate Installation (Let's Encrypt Certbot)

Install free SSL certificates for both domains:

```bash
sudo apt-get install -y certbot python3-certbot-nginx

# Obtain SSL for main site and ERP portal in one certificate
sudo certbot --nginx \
    -d jesusenthroned.org \
    -d www.jesusenthroned.org \
    -d portal.jesusenthroned.org \
    -d porta.jesusenthroned.org

# Certbot will automatically configure HTTPS redirects and renewals in Nginx!
```

---

## 7. Standalone SQL to PostgreSQL Migration

If you need to run or re-run the MySQL/phpMyAdmin data migration independently:

```bash
cd /var/www/jesusenthroned/jenc_backend
source venv/bin/activate

# Uses default port 5433 and password 'Admin @2025'
python scripts/migrate_sql_to_postgres.py ../db/nprfojqc_jenc_cleaned.sql --port 5433 --password "Admin @2025"
```

