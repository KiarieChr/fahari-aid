from django.contrib import admin
from .models import CommittedMembers


@admin.register(CommittedMembers)
class CommittedMembersAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'phone', 'email', 'residence', 'committed_on', 'created_at')
    search_fields = ('full_name', 'phone', 'email', 'residence')
    list_filter = ('committed_on',)
    date_hierarchy = 'committed_on'
