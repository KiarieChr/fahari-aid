import os
import hashlib
from pathlib import Path
import requests
from django.conf import settings

def resolve_logo_path(logo_url: str | None) -> str | None:
    """
    Resolve institutional logo URL or path to a local absolute path or file URI.
    Avoids WeasyPrint network timeouts and hangs.
    """
    if not logo_url:
        return None

    # Case 1: Local media path e.g. /media/branding/logo.png
    if logo_url.startswith('/media/'):
        rel_path = logo_url[len('/media/'):]
        local_path = Path(settings.MEDIA_ROOT) / rel_path
        if local_path.exists():
            return str(local_path.resolve())

    # Case 2: Full local filesystem path
    try:
        p = Path(logo_url)
        if p.is_file():
            return str(p.resolve())
    except Exception:
        pass

    # Case 3: External URL e.g. http:// or https://
    if logo_url.startswith(('http://', 'https://')):
        try:
            cache_dir = Path(settings.MEDIA_ROOT) / 'branding' / 'cache'
            cache_dir.mkdir(parents=True, exist_ok=True)
            url_hash = hashlib.md5(logo_url.encode('utf-8')).hexdigest()
            # Clean extension
            clean_url = logo_url.split('?')[0]
            ext = os.path.splitext(clean_url)[-1] or '.png'
            cached_file = cache_dir / f"logo_{url_hash}{ext}"

            if cached_file.exists() and cached_file.stat().st_size > 0:
                return str(cached_file.resolve())

            resp = requests.get(logo_url, timeout=4)
            if resp.status_code == 200 and resp.content:
                with open(cached_file, 'wb') as f:
                    f.write(resp.content)
                return str(cached_file.resolve())
        except Exception:
            return None

    return None
