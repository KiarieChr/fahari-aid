"""
Production Django Settings for Jesus Enthroned Church (jenc_backend).
Activated via DJANGO_SETTINGS_MODULE="config.settings_production"
or DJANGO_SETTINGS_MODULE="config.settings.production"
"""
import os
from pathlib import Path
from .settings import *

# Ensure BASE_DIR is available
BASE_DIR = Path(__file__).resolve().parent.parent

# Security
DEBUG = os.environ.get('DEBUG', 'False').lower() in ('true', '1', 'yes')
SECRET_KEY = os.environ.get(
    'SECRET_KEY',
    'django-insecure-prod-jesusenthroned-sg!rvxvj-6jl#ai$glosp**ar^wppv^kuk0%1@_#_z+2kgc1y='
)

# Allowed Hosts
ALLOWED_HOSTS = [
    'jesusenthroned.org',
    'www.jesusenthroned.org',
    'portal.jesusenthroned.org',
    'porta.jesusenthroned.org',
    '127.0.0.1',
    'localhost',
]
extra_hosts = os.environ.get('ALLOWED_HOSTS', '')
if extra_hosts:
    for h in extra_hosts.split(','):
        h_clean = h.strip()
        if h_clean and h_clean not in ALLOWED_HOSTS:
            ALLOWED_HOSTS.append(h_clean)

# Database Configuration (PostgreSQL on port 5433 with password 'Admin@2025')
DB_NAME = os.environ.get('DB_NAME', os.environ.get('PGDATABASE', 'jendb'))
DB_USER = os.environ.get('DB_USER', os.environ.get('PGUSER', 'postgres'))
DB_PASSWORD = os.environ.get('DB_PASSWORD', os.environ.get('PGPASSWORD', 'Admin@2025'))
DB_HOST = os.environ.get('DB_HOST', os.environ.get('PGHOST', 'localhost'))
DB_PORT = os.environ.get('DB_PORT', os.environ.get('PGPORT', '5433'))

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': DB_NAME,
        'USER': DB_USER,
        'PASSWORD': DB_PASSWORD,
        'HOST': DB_HOST,
        'PORT': str(DB_PORT),
        'CONN_MAX_AGE': 60,
    }
}

# Static & Media files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Security & Proxies
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = os.environ.get('SESSION_COOKIE_SECURE', 'True').lower() in ('true', '1')
CSRF_COOKIE_SECURE = os.environ.get('CSRF_COOKIE_SECURE', 'True').lower() in ('true', '1')

# CORS & CSRF
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = [
    'https://jesusenthroned.org',
    'https://www.jesusenthroned.org',
    'https://portal.jesusenthroned.org',
    'https://porta.jesusenthroned.org',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:8000',
]

CSRF_TRUSTED_ORIGINS = [
    'https://jesusenthroned.org',
    'https://www.jesusenthroned.org',
    'https://portal.jesusenthroned.org',
    'https://porta.jesusenthroned.org',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:8000',
]

