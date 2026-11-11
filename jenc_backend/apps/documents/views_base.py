from rest_framework.views import APIView
from rest_framework.renderers import BaseRenderer
from rest_framework.permissions import IsAuthenticated

class PassthroughPdfRenderer(BaseRenderer):
    """
    DRF renderer for binary PDF payloads.
    Matches 'application/pdf' media type to prevent HTTP 406 Not Acceptable.
    """
    media_type = 'application/pdf'
    format = 'pdf'
    charset = None
    render_style = 'binary'

    def render(self, data, accepted_media_type=None, renderer_context=None):
        return data


class BasePdfView(APIView):
    """
    Base APIView for all institutional PDF endpoints.
    Ensures DRF content negotiation accepts application/pdf and wildcard Accept headers.
    """
    permission_classes = [IsAuthenticated]
    renderer_classes = [PassthroughPdfRenderer]

    def perform_content_negotiation(self, request, force=False):
        # Bypass DRF strict negotiation so any Accept header (or application/pdf) succeeds cleanly
        return (PassthroughPdfRenderer(), 'application/pdf')
