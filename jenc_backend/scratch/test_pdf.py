from django.test import RequestFactory
from django.contrib.auth import get_user_model
from apps.events.views_pdf import EventAttendancePdfView

u = get_user_model().objects.first()
rf = RequestFactory()
req = rf.get('/api/events/1/attendance/pdf/?orientation=portrait')
req.user = u
view = EventAttendancePdfView.as_view()
resp = view(req, event_id=1)
print(f"SUCCESS! Status: {resp.status_code}, Length: {len(resp.content)} bytes, Content-Type: {resp.headers.get('Content-Type')}")
