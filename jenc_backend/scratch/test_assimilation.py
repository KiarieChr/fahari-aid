from django.test import RequestFactory
from django.contrib.auth import get_user_model
from apps.members.views_pdf import AssimilationPdfView

u = get_user_model().objects.first()
rf = RequestFactory()
req = rf.get('/api/assimilation/reports/pdf/?orientation=portrait')
req.user = u
view = AssimilationPdfView.as_view()
resp = view(req)
print(f"ASSIMILATION PDF SUCCESS! Status: {resp.status_code}, Length: {len(resp.content)} bytes, Content-Type: {resp.headers.get('Content-Type')}")
