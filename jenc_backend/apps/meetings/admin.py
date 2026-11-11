from django.contrib import admin
from .models import MeetingMinutes


@admin.register(MeetingMinutes)
class MeetingMinutesAdmin(admin.ModelAdmin):
    list_display = ('id', 'meeting', 'personnel', 'created_at', 'updated_at')
    search_fields = ('meeting__name', 'personnel', 'minutes')
    list_filter = ('created_at',)
