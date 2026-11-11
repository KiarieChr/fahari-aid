from django.db import models
from django.conf import settings
from core.models import MeetingType, Meeting, Attendance, Member, Cell, Department


class MeetingMinutes(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    meeting = models.ForeignKey(
        Meeting,
        on_delete=models.CASCADE,
        db_column='meeting_id',
        related_name='minutes_records',
    )
    minutes = models.TextField(blank=True, null=True, db_column='minutes')
    personnel = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='personnel',
        related_name='authored_minutes',
    )
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='update_at')

    class Meta:
        db_table = 'meeting_minutes'
        verbose_name = 'Meeting Minutes'
        verbose_name_plural = 'Meeting Minutes'

    def __str__(self):
        return f"Minutes for Meeting #{self.meeting_id}"
