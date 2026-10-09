"""
Django settings for cmsbackend project.
"""

from pathlib import Path
import os
from datetime import timedelta

# ── Load .env file (python-dotenv) ────────────────────────────────
# FIX 1: Load the .env file so SECRET_KEY is a proper 50-char key.
# Install if needed:  pip install python-dotenv
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parent.parent / ".env")
except ImportError:
    pass  # dotenv not installed — fall back to OS env vars

# ------------------------------
# BASE DIRECTORY
# ------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# ------------------------------
# SECURITY
# ------------------------------
# FIX 1 (cont.): SECRET_KEY now comes from .env — 50+ chars — no more
# InsecureKeyLengthWarning and JWT tokens will validate correctly.
SECRET_KEY = os.getenv("SECRET_KEY")

DEBUG = os.getenv("DEBUG", "True") == "True"

ALLOWED_HOSTS = [
    "127.0.0.1",
    "localhost",
    "cms-portfolio-backend.onrender.com",
]
# ------------------------------
# APPLICATIONS
# ------------------------------
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',

    # Custom apps
    'administration',
    'authentication',
    'doctor',
    'labtechnician',
    'pharmacist',
    'reception',
]

# ------------------------------
# MIDDLEWARE
# ------------------------------
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
# ------------------------------
# URLS & WSGI
# ------------------------------
ROOT_URLCONF = 'cmsbackend.urls'
WSGI_APPLICATION = 'cmsbackend.wsgi.application'

# ------------------------------
# TEMPLATES
# ------------------------------
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# ------------------------------
# DATABASE (MySQL)
# ------------------------------
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.getenv('DB_NAME', 'cms_portfolio'),
        'USER': os.getenv('DB_USER', 'root'),
        'PASSWORD': os.getenv('DB_PASSWORD', ''),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '3306'),
        'OPTIONS': (
            {'ssl': {'ca': os.getenv('DB_SSL_CA')}}
            if os.getenv('DB_SSL_CA')
            else ({'ssl': {}} if not DEBUG else {})
        ),
    }
}

# ------------------------------
# PASSWORD VALIDATION
# ------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# ------------------------------
# INTERNATIONALIZATION
# ------------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'

USE_I18N = True
USE_TZ = True

# ------------------------------
# STATIC & MEDIA FILES
# ------------------------------
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'static'
STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# ------------------------------
# DJANGO REST FRAMEWORK
# ------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        # Cookie-based JWT (primary — reads HttpOnly 'access_token' cookie)
        "authentication.cookie_auth.CookieJWTAuthentication",

        # Fallback: Authorization: Bearer <token> header
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend"
    ],
}

# ------------------------------
# JWT SETTINGS
# ------------------------------
# FIX 2: Explicitly pass SIGNING_KEY so SimpleJWT uses the full SECRET_KEY
# (already fixed to 50+ chars via .env). Without this, older SimpleJWT
# versions may fall back to a short default and still raise the warning.
# ACCESS_TOKEN_LIFETIME is now 60 min — matches the cookie max_age in views.py.
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':  timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'AUTH_HEADER_TYPES': ('Bearer',),
    # FIX 2: Explicit signing key — must be >= 32 bytes (satisfied by .env value)
    'SIGNING_KEY': SECRET_KEY,
}

# ------------------------------
# CORS SETTINGS (React frontend)
# ------------------------------
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

CORS_ALLOW_CREDENTIALS = True

# ------------------------------
# COOKIE SETTINGS
# ------------------------------
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = False   # Must be False so the frontend JS can read it

SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = not DEBUG