from django.db import models
from core.models import Member, Department, Cell, Attendance, Meeting


class CommittedMembers(models.Model):
    id = models.BigAutoField(primary_key=True, db_column='id')
    member = models.ForeignKey(
        Member,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='member_id',
        related_name='committed_member_records'
    )
    full_name = models.CharField(max_length=150, db_column='full_name')
    phone = models.CharField(max_length=30, db_column='phone')
    email = models.CharField(max_length=150, blank=True, null=True, db_column='email')
    residence = models.CharField(max_length=150, blank=True, null=True, db_column='residence')
    committed_on = models.DateField(blank=True, null=True, db_column='committed_on')
    created_at = models.DateTimeField(blank=True, null=True, auto_now_add=True, db_column='created_at')

    class Meta:
        db_table = 'committed_members'
        managed = False

    def __str__(self):
        return self.full_name
