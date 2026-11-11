import os
from django.utils import timezone
from django.template.loader import render_to_string
from django.conf import settings
from weasyprint import HTML
from core.models import InstitutionSetting
from apps.documents.models import GeneratedDocument
from apps.documents.services.branding import resolve_logo_path

def render_pdf(template_code: str, context: dict, user=None, persist: bool = True, orientation: str = None) -> tuple[bytes, str]:
    """
    Renders an HTML template into PDF bytes using WeasyPrint and active branding.
    Supports orientation: 'portrait' or 'landscape'.
    Returns (pdf_bytes, file_name).
    """
    branding = InstitutionSetting.get_settings()
    resolved_logo = resolve_logo_path(branding.logo_url)
    doc_orientation = (orientation or context.get('orientation') or 'portrait').lower()
    if doc_orientation not in ('portrait', 'landscape'):
        doc_orientation = 'portrait'

    branding_snapshot = {
        'name': branding.name or 'Jesus Enthroned Network',
        'short_name': branding.short_name or 'J.E.N',
        'tagline': branding.tagline or 'Enthroning Christ in all Spheres',
        'logo_url': resolved_logo or branding.logo_url,
        'primary_color': branding.primary_color or '#1e3a8a',
        'accent_color': branding.accent_color or '#d97706',
        'secondary_color': branding.secondary_color or '#0f172a',
        'currency_symbol': branding.currency_symbol or 'KSh',
        'official_email': branding.official_email,
        'official_phone': branding.official_phone,
        'physical_address': branding.physical_address,
    }

    render_context = {
        **context,
        'branding': branding_snapshot,
        'orientation': doc_orientation,
        'generated_at': timezone.now(),
    }

    template_path = f"pdf/{template_code}.html"
    html_string = render_to_string(template_path, render_context)

    # Base URL for local asset resolution
    base_url = str(settings.BASE_DIR)
    pdf_bytes = HTML(string=html_string, base_url=base_url).write_pdf()

    # Generate meaningful file name
    timestamp_str = timezone.now().strftime('%Y%m%d_%H%M%S')
    doc_id = (
        context.get('id')
        or (context.get('meeting') and getattr(context['meeting'], 'id', None))
        or (context.get('event') and getattr(context['event'], 'id', None))
        or (context.get('member') and getattr(context['member'], 'id', None))
        or timestamp_str
    )
    file_name = f"{template_code}_{doc_id}.pdf"

    if persist:
        try:
            GeneratedDocument.objects.create(
                document_type=template_code,
                template_code=template_code,
                file_name=file_name,
                pdf_size_bytes=len(pdf_bytes),
                branding_snapshot=branding_snapshot,
                created_by=user if user and user.is_authenticated else None,
            )
        except Exception:
            # Table might not be migrated yet or logging failed; do not break PDF delivery
            pass

    return pdf_bytes, file_name
