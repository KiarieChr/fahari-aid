from datetime import timedelta
from django.utils import timezone
from rest_framework import serializers
from core.models import MeetingType, Meeting, Attendance, Member, Cell, Department
from .models import MeetingMinutes


class MeetingTypeSerializer(serializers.ModelSerializer):
    meeting_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = MeetingType
        fields = ['id', 'name', 'meeting_count']


class MeetingMinutesSerializer(serializers.ModelSerializer):
    meeting_id = serializers.IntegerField(source='meeting.id', read_only=True)
    personnel_id = serializers.IntegerField(source='personnel.id', read_only=True, allow_null=True)
    personnel_name = serializers.SerializerMethodField()

    class Meta:
        model = MeetingMinutes
        fields = [
            'id', 'meeting_id', 'minutes', 'personnel_id', 'personnel_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_personnel_name(self, obj):
        personnel = getattr(obj, 'personnel', None)
        if not personnel:
            return None
        member = getattr(personnel, 'member', None)
        if member:
            fn = f"{member.first_name or ''} {member.last_name or ''}".strip()
            if fn:
                return fn
        if hasattr(personnel, 'get_full_name') and personnel.get_full_name():
            return personnel.get_full_name()
        return getattr(personnel, 'email', str(personnel))


class MeetingListSerializer(serializers.ModelSerializer):
    meeting_type_id = serializers.IntegerField(source='meeting_type.id', read_only=True, allow_null=True)
    meeting_type_name = serializers.CharField(source='meeting_type.name', read_only=True, allow_null=True)
    facilitator_id = serializers.IntegerField(source='facilitator.id', read_only=True)
    facilitator_name = serializers.SerializerMethodField()
    attendance_count = serializers.IntegerField(read_only=True, default=0)
    has_minutes = serializers.BooleanField(read_only=True, default=False)

    class Meta:
        model = Meeting
        fields = [
            'id', 'name', 'meeting_type_id', 'meeting_type_name',
            'facilitator_id', 'facilitator_name',
            'start_time', 'end_time', 'meeting_code', 'meeting_link',
            'attendance_count', 'has_minutes',
        ]

    def get_facilitator_name(self, obj):
        facilitator = getattr(obj, 'facilitator', None)
        if not facilitator:
            return "Unassigned"
        member = getattr(facilitator, 'member', None)
        if member:
            fn = f"{member.first_name or ''} {member.last_name or ''}".strip()
            if fn:
                return fn
        if hasattr(facilitator, 'get_full_name') and facilitator.get_full_name():
            return facilitator.get_full_name()
        if getattr(facilitator, 'email', None):
            return facilitator.email
        return "Unassigned"


class MeetingDetailSerializer(MeetingListSerializer):
    description = serializers.CharField(allow_null=True, required=False)
    banner = serializers.CharField(allow_null=True, required=False)
    branch = serializers.CharField(allow_null=True, required=False)
    minutes = serializers.SerializerMethodField()

    class Meta(MeetingListSerializer.Meta):
        fields = MeetingListSerializer.Meta.fields + [
            'description', 'banner', 'branch', 'minutes'
        ]

    def get_minutes(self, obj):
        try:
            first_minutes = obj.minutes_records.first()
            if first_minutes:
                return MeetingMinutesSerializer(first_minutes).data
        except Exception:
            pass
        return None


class AttendanceRecordSerializer(serializers.ModelSerializer):
    member_id = serializers.IntegerField(source='member_id.id', read_only=True)
    member_name = serializers.SerializerMethodField()
    phone_no = serializers.CharField(source='member_id.phone_no', read_only=True, allow_null=True)
    meeting_id = serializers.IntegerField(source='meeting_id.id', read_only=True)
    duration_minutes = serializers.SerializerMethodField()

    class Meta:
        model = Attendance
        fields = [
            'id', 'member_id', 'member_name', 'phone_no',
            'login_time', 'meeting_id', 'duration_minutes'
        ]

    def get_member_name(self, obj):
        m = getattr(obj, 'member_id', None)
        if m:
            return f"{m.first_name or ''} {m.last_name or ''}".strip()
        return "Unknown"

    def get_duration_minutes(self, obj):
        meeting = getattr(obj, 'meeting_id', None)
        if not meeting or not meeting.end_time or not obj.login_time:
            return None
        now = timezone.now()
        eff_end = min(meeting.end_time, now)
        if eff_end > obj.login_time:
            diff = (eff_end - obj.login_time).total_seconds() / 60.0
            return round(diff, 1)
        return 0.0


class AttendanceMemberRowSerializer(serializers.Serializer):
    member_id = serializers.IntegerField()
    name = serializers.CharField()
    cell_name = serializers.CharField(allow_null=True)
    department = serializers.CharField(allow_null=True)
    gender = serializers.CharField(allow_null=True)
    attended_count = serializers.IntegerField()
    total_meetings = serializers.IntegerField()
    attendance_rate = serializers.FloatField()
    status_label = serializers.CharField()
    last_attended = serializers.DateTimeField(allow_null=True)
